#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

const SOURCE_PATH = path.join(rootDir, 'data/meds/source/medications.source.json');
const CURATED_PATH = path.join(rootDir, 'data/meds/curated/medications.curated.json');
const COMPILED_PATH = path.join(rootDir, 'data/meds/compiled/medications.compiled.json');
const REVIEW_PATH = path.join(rootDir, 'data/meds/review/review-queue.json');

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function defaultFormulation(id, label = 'Tablet', route = 'oral', dosageForm = 'tablet') {
  return {
    formulation_id: `${id}-${slugify(label)}-${slugify(route)}`,
    label,
    route,
    dosage_form: dosageForm,
    strength_examples: [],
    common_adult_psych_dosing: {
      start: 'No summary available yet.',
      target: 'Pending review.',
      max: 'Verify official source.',
    },
    titration_notes: ['No summary available yet.'],
    formulation_specific_pearls: [],
    formulation_specific_interactions: [],
    formulation_specific_side_effect_notes: [],
    administration_notes: [],
    source_links: [],
    active: true,
  };
}

function buildFormulation(id, label, route, dosageForm, dosing, extras = {}) {
  const base = defaultFormulation(id, label, route, dosageForm);
  return {
    ...base,
    common_adult_psych_dosing: {
      start: dosing.start,
      target: dosing.target,
      max: dosing.max,
    },
    ...extras,
  };
}

function medEntry({
  generic,
  psychClass,
  brands = [],
  aliases = [],
  newerBrand = false,
  formulations = null,
}) {
  const id = slugify(generic);
  return {
    id,
    generic_name: generic,
    brand_names: brands,
    aliases: aliases.length ? aliases : [...brands],
    psych_class: psychClass,
    active: true,
    newer_brand: newerBrand,
    fda_psych_uses: [],
    off_label_psych_uses: [],
    moa_summary: 'No summary available yet.',
    common_side_effects: [],
    important_risks: [],
    psych_interactions: [],
    clinical_pearls: [],
    source_links: [],
    source_last_checked: null,
    editorial_last_reviewed: null,
    content_review_status: 'source scored',
    missing_data_flags: ['psych dosing', 'psych interactions', 'common side effects', 'clinical pearls'],
    formulations: formulations && formulations.length
      ? formulations
      : [defaultFormulation(id)],
  };
}

const groupedSeed = [
  {
    psychClass: 'SSRIs',
    meds: [
      medEntry({ generic: 'citalopram', psychClass: 'SSRIs', brands: ['Celexa'] }),
      medEntry({ generic: 'escitalopram', psychClass: 'SSRIs', brands: ['Lexapro'] }),
      medEntry({ generic: 'fluoxetine', psychClass: 'SSRIs', brands: ['Prozac', 'Sarafem'] }),
      medEntry({ generic: 'fluvoxamine', psychClass: 'SSRIs', brands: ['Luvox'] }),
      medEntry({ generic: 'paroxetine', psychClass: 'SSRIs', brands: ['Paxil', 'Paxil CR', 'Brisdelle'] }),
      medEntry({ generic: 'sertraline', psychClass: 'SSRIs', brands: ['Zoloft'] }),
      medEntry({ generic: 'vilazodone', psychClass: 'SSRIs', brands: ['Viibryd'], newerBrand: true }),
      medEntry({ generic: 'vortioxetine', psychClass: 'SSRIs', brands: ['Trintellix'], newerBrand: true }),
    ],
  },
  {
    psychClass: 'SNRIs',
    meds: [
      medEntry({ generic: 'venlafaxine', psychClass: 'SNRIs', brands: ['Effexor XR'] }),
      medEntry({ generic: 'desvenlafaxine', psychClass: 'SNRIs', brands: ['Pristiq'] }),
      medEntry({ generic: 'duloxetine', psychClass: 'SNRIs', brands: ['Cymbalta'] }),
      medEntry({ generic: 'levomilnacipran', psychClass: 'SNRIs', brands: ['Fetzima'] }),
      medEntry({ generic: 'milnacipran', psychClass: 'SNRIs', brands: ['Savella'] }),
      medEntry({ generic: 'atomoxetine', psychClass: 'SNRIs', brands: ['Strattera'] }),
      medEntry({ generic: 'sibutramine', psychClass: 'SNRIs', brands: [] }),
    ],
  },
  {
    psychClass: 'NDRIs',
    meds: [
      medEntry({ generic: 'bupropion', psychClass: 'NDRIs', brands: ['Wellbutrin XL', 'Wellbutrin SR', 'Aplenzin', 'Forfivo XL'] }),
      medEntry({
        generic: 'dextromethorphan-bupropion',
        psychClass: 'NDRIs',
        brands: ['Auvelity'],
        newerBrand: true,
        formulations: [defaultFormulation('dextromethorphan-bupropion', 'Tablet', 'oral', 'tablet')],
      }),
    ],
  },
  {
    psychClass: 'Atypical antidepressants',
    meds: [
      medEntry({ generic: 'mirtazapine', psychClass: 'Atypical antidepressants', brands: ['Remeron'] }),
      medEntry({ generic: 'trazodone', psychClass: 'Atypical antidepressants', brands: ['Desyrel'] }),
      medEntry({ generic: 'nefazodone', psychClass: 'Atypical antidepressants' }),
      medEntry({ generic: 'amitriptyline', psychClass: 'Atypical antidepressants', brands: ['Elavil'] }),
      medEntry({ generic: 'nortriptyline', psychClass: 'Atypical antidepressants', brands: ['Pamelor'] }),
      medEntry({ generic: 'desipramine', psychClass: 'Atypical antidepressants', brands: ['Norpramin'] }),
      medEntry({ generic: 'imipramine', psychClass: 'Atypical antidepressants', brands: ['Tofranil'] }),
      medEntry({ generic: 'clomipramine', psychClass: 'Atypical antidepressants', brands: ['Anafranil'] }),
      medEntry({ generic: 'doxepin', psychClass: 'Atypical antidepressants', brands: ['Silenor'] }),
      medEntry({ generic: 'maprotiline', psychClass: 'Atypical antidepressants' }),
      medEntry({ generic: 'amoxapine', psychClass: 'Atypical antidepressants' }),
      medEntry({ generic: 'trimipramine', psychClass: 'Atypical antidepressants', brands: ['Surmontil'] }),
      medEntry({ generic: 'protriptyline', psychClass: 'Atypical antidepressants', brands: ['Vivactil'] }),
      medEntry({ generic: 'phenelzine', psychClass: 'Atypical antidepressants', brands: ['Nardil'] }),
      medEntry({ generic: 'tranylcypromine', psychClass: 'Atypical antidepressants', brands: ['Parnate'] }),
      medEntry({ generic: 'isocarboxazid', psychClass: 'Atypical antidepressants', brands: ['Marplan'] }),
      medEntry({ generic: 'selegiline transdermal', psychClass: 'Atypical antidepressants', brands: ['Emsam'] }),
      medEntry({ generic: 'zuranolone', psychClass: 'Atypical antidepressants', brands: ['Zurzuvae'], newerBrand: true }),
    ],
  },
  {
    psychClass: 'Stimulant ADHD medications',
    meds: [
      medEntry({ generic: 'amphetamine mixed salts IR', psychClass: 'Stimulant ADHD medications', brands: ['Adderall'] }),
      medEntry({ generic: 'amphetamine mixed salts XR', psychClass: 'Stimulant ADHD medications', brands: ['Adderall XR'] }),
      medEntry({ generic: 'lisdexamfetamine', psychClass: 'Stimulant ADHD medications', brands: ['Vyvanse'] }),
      medEntry({ generic: 'dextroamphetamine', psychClass: 'Stimulant ADHD medications', brands: ['Dexedrine', 'Zenzedi'] }),
      medEntry({ generic: 'methamphetamine', psychClass: 'Stimulant ADHD medications', brands: ['Desoxyn'] }),
      medEntry({ generic: 'methylphenidate IR', psychClass: 'Stimulant ADHD medications', brands: ['Ritalin', 'Methylin'] }),
      medEntry({ generic: 'methylphenidate ER', psychClass: 'Stimulant ADHD medications', brands: ['Concerta', 'Ritalin LA', 'Metadate CD'] }),
      medEntry({ generic: 'dexmethylphenidate', psychClass: 'Stimulant ADHD medications', brands: ['Focalin'] }),
      medEntry({ generic: 'dexmethylphenidate XR', psychClass: 'Stimulant ADHD medications', brands: ['Focalin XR'] }),
      medEntry({ generic: 'serdexmethylphenidate-dexmethylphenidate', psychClass: 'Stimulant ADHD medications', brands: ['Azstarys'], newerBrand: true }),
      medEntry({ generic: 'methylphenidate PM', psychClass: 'Stimulant ADHD medications', brands: ['Jornay PM'], newerBrand: true }),
      medEntry({ generic: 'amphetamine mixed salts ER', psychClass: 'Stimulant ADHD medications', brands: ['Mydayis'], newerBrand: true }),
      medEntry({ generic: 'amphetamine sulfate', psychClass: 'Stimulant ADHD medications', brands: ['Evekeo'] }),
      medEntry({ generic: 'amphetamine XR ODT', psychClass: 'Stimulant ADHD medications', brands: ['Adzenys XR-ODT'] }),
      medEntry({ generic: 'amphetamine XR suspension', psychClass: 'Stimulant ADHD medications', brands: ['Dyanavel XR'] }),
      medEntry({ generic: 'methylphenidate chewable ER', psychClass: 'Stimulant ADHD medications', brands: ['QuilliChew ER'] }),
      medEntry({ generic: 'methylphenidate suspension ER', psychClass: 'Stimulant ADHD medications', brands: ['Quillivant XR'] }),
      medEntry({ generic: 'methylphenidate ODT XR', psychClass: 'Stimulant ADHD medications', brands: ['Cotempla XR-ODT'] }),
      medEntry({ generic: 'methylphenidate transdermal', psychClass: 'Stimulant ADHD medications', brands: ['Daytrana'] }),
      medEntry({ generic: 'dextroamphetamine transdermal', psychClass: 'Stimulant ADHD medications', brands: ['Xelstrym'], newerBrand: true }),
    ],
  },
  {
    psychClass: 'Non-stimulant ADHD medications',
    meds: [
      medEntry({ generic: 'atomoxetine', psychClass: 'Non-stimulant ADHD medications', brands: ['Strattera'] }),
      medEntry({ generic: 'viloxazine', psychClass: 'Non-stimulant ADHD medications', brands: ['Qelbree'], newerBrand: true }),
      medEntry({ generic: 'guanfacine IR', psychClass: 'Non-stimulant ADHD medications', brands: ['Tenex'] }),
      medEntry({ generic: 'guanfacine ER', psychClass: 'Non-stimulant ADHD medications', brands: ['Intuniv'] }),
      medEntry({ generic: 'clonidine IR', psychClass: 'Non-stimulant ADHD medications', brands: ['Catapres'] }),
      medEntry({ generic: 'clonidine ER', psychClass: 'Non-stimulant ADHD medications', brands: ['Kapvay'] }),
      medEntry({ generic: 'modafinil', psychClass: 'Non-stimulant ADHD medications', brands: ['Provigil'] }),
      medEntry({ generic: 'armodafinil', psychClass: 'Non-stimulant ADHD medications', brands: ['Nuvigil'] }),
      medEntry({ generic: 'bupropion', psychClass: 'Non-stimulant ADHD medications', brands: ['Wellbutrin XL'] }),
      medEntry({ generic: 'nortriptyline', psychClass: 'Non-stimulant ADHD medications', brands: ['Pamelor'] }),
    ],
  },
  {
    psychClass: 'Benzodiazepines',
    meds: [
      medEntry({ generic: 'alprazolam', psychClass: 'Benzodiazepines', brands: ['Xanax'] }),
      medEntry({ generic: 'clonazepam', psychClass: 'Benzodiazepines', brands: ['Klonopin'] }),
      medEntry({ generic: 'lorazepam', psychClass: 'Benzodiazepines', brands: ['Ativan'] }),
      medEntry({ generic: 'diazepam', psychClass: 'Benzodiazepines', brands: ['Valium'] }),
      medEntry({ generic: 'temazepam', psychClass: 'Benzodiazepines', brands: ['Restoril'] }),
      medEntry({ generic: 'oxazepam', psychClass: 'Benzodiazepines', brands: ['Serax'] }),
      medEntry({ generic: 'chlordiazepoxide', psychClass: 'Benzodiazepines', brands: ['Librium'] }),
      medEntry({ generic: 'clorazepate', psychClass: 'Benzodiazepines', brands: ['Tranxene'] }),
      medEntry({ generic: 'triazolam', psychClass: 'Benzodiazepines', brands: ['Halcion'] }),
      medEntry({ generic: 'estazolam', psychClass: 'Benzodiazepines', brands: ['ProSom'] }),
      medEntry({ generic: 'flurazepam', psychClass: 'Benzodiazepines', brands: ['Dalmane'] }),
      medEntry({ generic: 'quazepam', psychClass: 'Benzodiazepines', brands: ['Doral'] }),
      medEntry({ generic: 'midazolam', psychClass: 'Benzodiazepines', brands: ['Versed'] }),
      medEntry({ generic: 'diazepam nasal', psychClass: 'Benzodiazepines', brands: ['Valtoco'] }),
      medEntry({ generic: 'midazolam nasal', psychClass: 'Benzodiazepines', brands: ['Nayzilam'] }),
    ],
  },
  {
    psychClass: 'Sleep / hypnotic medications',
    meds: [
      medEntry({ generic: 'zolpidem', psychClass: 'Sleep / hypnotic medications', brands: ['Ambien'] }),
      medEntry({ generic: 'zolpidem ER', psychClass: 'Sleep / hypnotic medications', brands: ['Ambien CR'] }),
      medEntry({ generic: 'zaleplon', psychClass: 'Sleep / hypnotic medications', brands: ['Sonata'] }),
      medEntry({ generic: 'eszopiclone', psychClass: 'Sleep / hypnotic medications', brands: ['Lunesta'] }),
      medEntry({ generic: 'ramelteon', psychClass: 'Sleep / hypnotic medications', brands: ['Rozerem'] }),
      medEntry({ generic: 'suvorexant', psychClass: 'Sleep / hypnotic medications', brands: ['Belsomra'] }),
      medEntry({ generic: 'lemborexant', psychClass: 'Sleep / hypnotic medications', brands: ['Dayvigo'], newerBrand: true }),
      medEntry({ generic: 'daridorexant', psychClass: 'Sleep / hypnotic medications', brands: ['Quviviq'], newerBrand: true }),
      medEntry({ generic: 'doxepin low-dose', psychClass: 'Sleep / hypnotic medications', brands: ['Silenor'] }),
      medEntry({ generic: 'hydroxyzine', psychClass: 'Sleep / hypnotic medications', brands: ['Vistaril', 'Atarax'] }),
      medEntry({ generic: 'diphenhydramine', psychClass: 'Sleep / hypnotic medications', brands: ['Benadryl'] }),
      medEntry({ generic: 'trazodone', psychClass: 'Sleep / hypnotic medications', brands: ['Desyrel'] }),
      medEntry({ generic: 'gabapentin', psychClass: 'Sleep / hypnotic medications', brands: ['Neurontin'] }),
      medEntry({ generic: 'pregabalin', psychClass: 'Sleep / hypnotic medications', brands: ['Lyrica'] }),
      medEntry({ generic: 'melatonin receptor agonist', psychClass: 'Sleep / hypnotic medications' }),
    ],
  },
  {
    psychClass: 'Antipsychotics',
    meds: [
      medEntry({ generic: 'aripiprazole', psychClass: 'Antipsychotics', brands: ['Abilify'] }),
      medEntry({ generic: 'brexpiprazole', psychClass: 'Antipsychotics', brands: ['Rexulti'], newerBrand: true }),
      medEntry({ generic: 'cariprazine', psychClass: 'Antipsychotics', brands: ['Vraylar'], newerBrand: true }),
      medEntry({ generic: 'quetiapine IR', psychClass: 'Antipsychotics', brands: ['Seroquel'] }),
      medEntry({ generic: 'quetiapine XR', psychClass: 'Antipsychotics', brands: ['Seroquel XR'] }),
      medEntry({ generic: 'olanzapine', psychClass: 'Antipsychotics', brands: ['Zyprexa'] }),
      medEntry({ generic: 'olanzapine-fluoxetine', psychClass: 'Antipsychotics', brands: ['Symbyax'] }),
      medEntry({ generic: 'olanzapine-samidorphan', psychClass: 'Antipsychotics', brands: ['Lybalvi'], newerBrand: true }),
      medEntry({ generic: 'risperidone', psychClass: 'Antipsychotics', brands: ['Risperdal'] }),
      medEntry({ generic: 'paliperidone oral', psychClass: 'Antipsychotics', brands: ['Invega'] }),
      medEntry({ generic: 'ziprasidone', psychClass: 'Antipsychotics', brands: ['Geodon'] }),
      medEntry({ generic: 'lurasidone', psychClass: 'Antipsychotics', brands: ['Latuda'] }),
      medEntry({ generic: 'lumateperone', psychClass: 'Antipsychotics', brands: ['Caplyta'], newerBrand: true }),
      medEntry({ generic: 'asenapine sublingual', psychClass: 'Antipsychotics', brands: ['Saphris'] }),
      medEntry({ generic: 'iloperidone', psychClass: 'Antipsychotics', brands: ['Fanapt'] }),
      medEntry({ generic: 'haloperidol', psychClass: 'Antipsychotics', brands: ['Haldol'] }),
      medEntry({ generic: 'chlorpromazine', psychClass: 'Antipsychotics', brands: ['Thorazine'] }),
      medEntry({ generic: 'perphenazine', psychClass: 'Antipsychotics', brands: ['Trilafon'] }),
      medEntry({ generic: 'trifluoperazine', psychClass: 'Antipsychotics', brands: ['Stelazine'] }),
      medEntry({ generic: 'loxapine', psychClass: 'Antipsychotics', brands: ['Loxitane'] }),
      medEntry({ generic: 'molindone', psychClass: 'Antipsychotics' }),
      medEntry({ generic: 'pimozide', psychClass: 'Antipsychotics', brands: ['Orap'] }),
      medEntry({ generic: 'thiothixene', psychClass: 'Antipsychotics', brands: ['Navane'] }),
      medEntry({ generic: 'thioridazine', psychClass: 'Antipsychotics', brands: ['Mellaril'] }),
      medEntry({ generic: 'fluphenazine', psychClass: 'Antipsychotics', brands: ['Prolixin'] }),
      medEntry({ generic: 'xanomeline-trospium', psychClass: 'Antipsychotics', brands: ['Cobenfy'], newerBrand: true }),
      medEntry({ generic: 'pimavanserin', psychClass: 'Antipsychotics', brands: ['Nuplazid'], newerBrand: true }),
    ],
  },
  {
    psychClass: 'Mood stabilizers',
    meds: [
      medEntry({ generic: 'lithium carbonate', psychClass: 'Mood stabilizers', brands: ['Lithobid', 'Eskalith'] }),
      medEntry({ generic: 'lithium citrate', psychClass: 'Mood stabilizers', brands: ['Cibalith-S'] }),
      medEntry({ generic: 'lamotrigine', psychClass: 'Mood stabilizers', brands: ['Lamictal'] }),
      medEntry({ generic: 'divalproex', psychClass: 'Mood stabilizers', brands: ['Depakote'] }),
      medEntry({ generic: 'valproic acid', psychClass: 'Mood stabilizers', brands: ['Depakene'] }),
      medEntry({ generic: 'carbamazepine', psychClass: 'Mood stabilizers', brands: ['Tegretol'] }),
      medEntry({ generic: 'oxcarbazepine', psychClass: 'Mood stabilizers', brands: ['Trileptal'] }),
      medEntry({ generic: 'topiramate', psychClass: 'Mood stabilizers', brands: ['Topamax'] }),
      medEntry({ generic: 'zonisamide', psychClass: 'Mood stabilizers', brands: ['Zonegran'] }),
      medEntry({ generic: 'gabapentin', psychClass: 'Mood stabilizers', brands: ['Neurontin'] }),
      medEntry({ generic: 'pregabalin', psychClass: 'Mood stabilizers', brands: ['Lyrica'] }),
      medEntry({ generic: 'levetiracetam', psychClass: 'Mood stabilizers', brands: ['Keppra'] }),
    ],
  },
  {
    psychClass: 'Alpha agonists',
    meds: [
      medEntry({ generic: 'guanfacine IR', psychClass: 'Alpha agonists', brands: ['Tenex'] }),
      medEntry({ generic: 'guanfacine ER', psychClass: 'Alpha agonists', brands: ['Intuniv'] }),
      medEntry({ generic: 'clonidine IR', psychClass: 'Alpha agonists', brands: ['Catapres'] }),
      medEntry({ generic: 'clonidine ER', psychClass: 'Alpha agonists', brands: ['Kapvay'] }),
      medEntry({ generic: 'prazosin', psychClass: 'Alpha agonists', brands: ['Minipress'] }),
      medEntry({ generic: 'doxazosin', psychClass: 'Alpha agonists', brands: ['Cardura'] }),
      medEntry({ generic: 'terazosin', psychClass: 'Alpha agonists', brands: ['Hytrin'] }),
    ],
  },
  {
    psychClass: 'Beta blockers commonly used in psych',
    meds: [
      medEntry({ generic: 'propranolol', psychClass: 'Beta blockers commonly used in psych', brands: ['Inderal'] }),
      medEntry({ generic: 'atenolol', psychClass: 'Beta blockers commonly used in psych', brands: ['Tenormin'] }),
      medEntry({ generic: 'metoprolol', psychClass: 'Beta blockers commonly used in psych', brands: ['Lopressor', 'Toprol XL'] }),
      medEntry({ generic: 'nadolol', psychClass: 'Beta blockers commonly used in psych', brands: ['Corgard'] }),
      medEntry({ generic: 'bisoprolol', psychClass: 'Beta blockers commonly used in psych', brands: ['Zebeta'] }),
      medEntry({ generic: 'carvedilol', psychClass: 'Beta blockers commonly used in psych', brands: ['Coreg'] }),
    ],
  },
  {
    psychClass: 'Anxiolytics / anxiety adjuncts',
    meds: [
      medEntry({ generic: 'buspirone', psychClass: 'Anxiolytics / anxiety adjuncts', brands: ['Buspar'] }),
      medEntry({ generic: 'hydroxyzine', psychClass: 'Anxiolytics / anxiety adjuncts', brands: ['Vistaril', 'Atarax'] }),
      medEntry({ generic: 'gabapentin', psychClass: 'Anxiolytics / anxiety adjuncts', brands: ['Neurontin'] }),
      medEntry({ generic: 'pregabalin', psychClass: 'Anxiolytics / anxiety adjuncts', brands: ['Lyrica'] }),
      medEntry({ generic: 'propranolol', psychClass: 'Anxiolytics / anxiety adjuncts', brands: ['Inderal'] }),
      medEntry({ generic: 'prazosin', psychClass: 'Anxiolytics / anxiety adjuncts', brands: ['Minipress'] }),
      medEntry({ generic: 'cyproheptadine', psychClass: 'Anxiolytics / anxiety adjuncts', brands: ['Periactin'] }),
      medEntry({ generic: 'clonidine IR', psychClass: 'Anxiolytics / anxiety adjuncts', brands: ['Catapres'] }),
      medEntry({ generic: 'guanfacine IR', psychClass: 'Anxiolytics / anxiety adjuncts', brands: ['Tenex'] }),
      medEntry({ generic: 'quetiapine IR', psychClass: 'Anxiolytics / anxiety adjuncts', brands: ['Seroquel'] }),
      medEntry({ generic: 'lamotrigine', psychClass: 'Anxiolytics / anxiety adjuncts', brands: ['Lamictal'] }),
      medEntry({ generic: 'mirtazapine', psychClass: 'Anxiolytics / anxiety adjuncts', brands: ['Remeron'] }),
      medEntry({ generic: 'trazodone', psychClass: 'Anxiolytics / anxiety adjuncts', brands: ['Desyrel'] }),
      medEntry({ generic: 'duloxetine', psychClass: 'Anxiolytics / anxiety adjuncts', brands: ['Cymbalta'] }),
      medEntry({ generic: 'venlafaxine', psychClass: 'Anxiolytics / anxiety adjuncts', brands: ['Effexor XR'] }),
    ],
  },
  {
    psychClass: 'Substance use support medications',
    meds: [
      medEntry({ generic: 'naltrexone oral', psychClass: 'Substance use support medications', brands: ['Revia'] }),
      medEntry({ generic: 'acamprosate', psychClass: 'Substance use support medications', brands: ['Campral'] }),
      medEntry({ generic: 'disulfiram', psychClass: 'Substance use support medications', brands: ['Antabuse'] }),
      medEntry({ generic: 'naloxone intranasal', psychClass: 'Substance use support medications', brands: ['Narcan'] }),
      medEntry({ generic: 'nalmefene intranasal', psychClass: 'Substance use support medications', brands: ['Zimhi'] }),
      medEntry({ generic: 'lofexidine', psychClass: 'Substance use support medications', brands: ['Lucemyra'] }),
      medEntry({ generic: 'varenicline', psychClass: 'Substance use support medications', brands: ['Chantix'] }),
      medEntry({ generic: 'nicotine transdermal', psychClass: 'Substance use support medications', brands: ['Nicoderm CQ'] }),
      medEntry({ generic: 'nicotine gum', psychClass: 'Substance use support medications', brands: ['Nicorette'] }),
      medEntry({ generic: 'nicotine lozenge', psychClass: 'Substance use support medications', brands: ['Commit'] }),
      medEntry({ generic: 'bupropion SR smoking cessation', psychClass: 'Substance use support medications', brands: ['Zyban'] }),
    ],
  },
  {
    psychClass: 'Antidepressant augmenters',
    meds: [
      medEntry({ generic: 'aripiprazole', psychClass: 'Antidepressant augmenters', brands: ['Abilify'] }),
      medEntry({ generic: 'brexpiprazole', psychClass: 'Antidepressant augmenters', brands: ['Rexulti'] }),
      medEntry({ generic: 'quetiapine XR', psychClass: 'Antidepressant augmenters', brands: ['Seroquel XR'] }),
      medEntry({ generic: 'lithium carbonate', psychClass: 'Antidepressant augmenters', brands: ['Lithobid'] }),
      medEntry({ generic: 'lamotrigine', psychClass: 'Antidepressant augmenters', brands: ['Lamictal'] }),
      medEntry({ generic: 'buspirone', psychClass: 'Antidepressant augmenters', brands: ['Buspar'] }),
      medEntry({ generic: 'liothyronine', psychClass: 'Antidepressant augmenters', brands: ['Cytomel'] }),
      medEntry({ generic: 'modafinil', psychClass: 'Antidepressant augmenters', brands: ['Provigil'] }),
      medEntry({ generic: 'methylfolate', psychClass: 'Antidepressant augmenters', brands: ['Deplin'] }),
      medEntry({ generic: 'bupropion', psychClass: 'Antidepressant augmenters', brands: ['Wellbutrin XL'] }),
      medEntry({ generic: 'mirtazapine', psychClass: 'Antidepressant augmenters', brands: ['Remeron'] }),
      medEntry({ generic: 'ketamine intranasal', psychClass: 'Antidepressant augmenters', brands: ['Spravato'], newerBrand: true }),
      medEntry({ generic: 'lisdexamfetamine', psychClass: 'Antidepressant augmenters', brands: ['Vyvanse'] }),
      medEntry({ generic: 'dextromethorphan-bupropion', psychClass: 'Antidepressant augmenters', brands: ['Auvelity'] }),
      medEntry({ generic: 'cariprazine', psychClass: 'Antidepressant augmenters', brands: ['Vraylar'] }),
      medEntry({ generic: 'lumateperone', psychClass: 'Antidepressant augmenters', brands: ['Caplyta'] }),
    ],
  },
  {
    psychClass: 'Other psych agents',
    meds: [
      medEntry({ generic: 'benztropine', psychClass: 'Other psych agents', brands: ['Cogentin'] }),
      medEntry({ generic: 'trihexyphenidyl', psychClass: 'Other psych agents', brands: ['Artane'] }),
      medEntry({ generic: 'deutetrabenazine', psychClass: 'Other psych agents', brands: ['Austedo'] }),
      medEntry({ generic: 'valbenazine', psychClass: 'Other psych agents', brands: ['Ingrezza'] }),
      medEntry({ generic: 'tetrabenazine', psychClass: 'Other psych agents', brands: ['Xenazine'] }),
      medEntry({ generic: 'memantine', psychClass: 'Other psych agents', brands: ['Namenda'] }),
      medEntry({ generic: 'donepezil', psychClass: 'Other psych agents', brands: ['Aricept'] }),
      medEntry({ generic: 'rivastigmine', psychClass: 'Other psych agents', brands: ['Exelon'] }),
      medEntry({ generic: 'galantamine', psychClass: 'Other psych agents', brands: ['Razadyne'] }),
      medEntry({ generic: 'amantadine', psychClass: 'Other psych agents', brands: ['Gocovri'] }),
      medEntry({ generic: 'baclofen', psychClass: 'Other psych agents', brands: ['Lioresal'] }),
      medEntry({ generic: 'tizanidine', psychClass: 'Other psych agents', brands: ['Zanaflex'] }),
      medEntry({ generic: 'cyclobenzaprine', psychClass: 'Other psych agents', brands: ['Flexeril'] }),
      medEntry({ generic: 'n-acetylcysteine', psychClass: 'Other psych agents', brands: [] }),
      medEntry({ generic: 'ondansetron', psychClass: 'Other psych agents', brands: ['Zofran'] }),
      medEntry({ generic: 'metoclopramide', psychClass: 'Other psych agents', brands: ['Reglan'] }),
      medEntry({ generic: 'lacosamide', psychClass: 'Other psych agents', brands: ['Vimpat'] }),
      medEntry({ generic: 'tiagabine', psychClass: 'Other psych agents', brands: ['Gabitril'] }),
      medEntry({ generic: 'rufinamide', psychClass: 'Other psych agents', brands: ['Banzel'] }),
      medEntry({ generic: 'eszopiclone', psychClass: 'Other psych agents', brands: ['Lunesta'] }),
      medEntry({ generic: 'zolpidem sublingual', psychClass: 'Other psych agents', brands: ['Intermezzo'] }),
      medEntry({ generic: 'zolpidem oral spray', psychClass: 'Other psych agents', brands: ['Zolpimist'] }),
      medEntry({ generic: 'alprazolam ODT', psychClass: 'Other psych agents', brands: ['Niravam'] }),
      medEntry({ generic: 'clonazepam ODT', psychClass: 'Other psych agents', brands: ['Klonopin ODT'] }),
      medEntry({ generic: 'lorazepam sublingual', psychClass: 'Other psych agents', brands: [] }),
      medEntry({ generic: 'asenapine transdermal', psychClass: 'Other psych agents', brands: ['Secuado'] }),
      medEntry({ generic: 'lithium orotate', psychClass: 'Other psych agents', brands: [] }),
      medEntry({ generic: 'dexmedetomidine sublingual', psychClass: 'Other psych agents', brands: ['Igalmi'], newerBrand: true }),
      medEntry({ generic: 'viloxazine ER', psychClass: 'Other psych agents', brands: ['Qelbree'] }),
      medEntry({ generic: 'modafinil oral suspension', psychClass: 'Other psych agents', brands: [] }),
      medEntry({ generic: 'fluoxetine weekly', psychClass: 'Other psych agents', brands: ['Prozac Weekly'] }),
      medEntry({ generic: 'paroxetine CR', psychClass: 'Other psych agents', brands: ['Paxil CR'] }),
      medEntry({ generic: 'venlafaxine ER', psychClass: 'Other psych agents', brands: ['Effexor XR'] }),
      medEntry({ generic: 'desvenlafaxine ER', psychClass: 'Other psych agents', brands: ['Pristiq'] }),
      medEntry({ generic: 'quetiapine ODT', psychClass: 'Other psych agents', brands: [] }),
      medEntry({ generic: 'risperidone ODT', psychClass: 'Other psych agents', brands: ['Risperdal M-Tab'] }),
      medEntry({ generic: 'olanzapine ODT', psychClass: 'Other psych agents', brands: ['Zyprexa Zydis'] }),
      medEntry({ generic: 'lamotrigine ODT', psychClass: 'Other psych agents', brands: [] }),
      medEntry({ generic: 'carbamazepine ER', psychClass: 'Other psych agents', brands: ['Tegretol XR'] }),
      medEntry({ generic: 'oxcarbazepine ER', psychClass: 'Other psych agents', brands: ['Oxtellar XR'] }),
      medEntry({ generic: 'topiramate ER', psychClass: 'Other psych agents', brands: ['Trokendi XR'] }),
      medEntry({ generic: 'gabapentin enacarbil', psychClass: 'Other psych agents', brands: ['Horizant'] }),
      medEntry({ generic: 'pregabalin ER', psychClass: 'Other psych agents', brands: ['Lyrica CR'] }),
      medEntry({ generic: 'propranolol ER', psychClass: 'Other psych agents', brands: ['Inderal LA'] }),
      medEntry({ generic: 'prazosin bedtime', psychClass: 'Other psych agents', brands: [] }),
      medEntry({ generic: 'hydroxyzine pamoate', psychClass: 'Other psych agents', brands: ['Vistaril'] }),
      medEntry({ generic: 'hydroxyzine hydrochloride', psychClass: 'Other psych agents', brands: ['Atarax'] }),
      medEntry({ generic: 'buspirone split dosing', psychClass: 'Other psych agents', brands: [] }),
      medEntry({ generic: 'naltrexone low dose', psychClass: 'Other psych agents', brands: [] }),
      medEntry({ generic: 'acamprosate delayed-release', psychClass: 'Other psych agents', brands: ['Campral'] }),
      medEntry({ generic: 'disulfiram supervised', psychClass: 'Other psych agents', brands: ['Antabuse'] }),
      medEntry({ generic: 'varenicline starter pack', psychClass: 'Other psych agents', brands: ['Chantix'] }),
      medEntry({ generic: 'nicotine inhaler', psychClass: 'Other psych agents', brands: ['Nicotrol'] }),
      medEntry({ generic: 'nicotine nasal spray', psychClass: 'Other psych agents', brands: ['Nicotrol NS'] }),
      medEntry({ generic: 'guanfacine patch', psychClass: 'Other psych agents', brands: [] }),
      medEntry({ generic: 'clonidine patch', psychClass: 'Other psych agents', brands: ['Catapres-TTS'] }),
      medEntry({ generic: 'memantine ER', psychClass: 'Other psych agents', brands: ['Namenda XR'] }),
      medEntry({ generic: 'donepezil ODT', psychClass: 'Other psych agents', brands: ['Aricept ODT'] }),
      medEntry({ generic: 'rivastigmine patch', psychClass: 'Other psych agents', brands: ['Exelon Patch'] }),
      medEntry({ generic: 'galantamine ER', psychClass: 'Other psych agents', brands: ['Razadyne ER'] }),
      medEntry({ generic: 'armodafinil tablet', psychClass: 'Other psych agents', brands: ['Nuvigil'] }),
      medEntry({ generic: 'modafinil tablet', psychClass: 'Other psych agents', brands: ['Provigil'] }),
      medEntry({ generic: 'eszopiclone low dose', psychClass: 'Other psych agents', brands: ['Lunesta'] }),
      medEntry({ generic: 'zaleplon low dose', psychClass: 'Other psych agents', brands: ['Sonata'] }),
      medEntry({ generic: 'daridorexant dual orexin antagonist', psychClass: 'Other psych agents', brands: ['Quviviq'] }),
      medEntry({ generic: 'lemborexant dual orexin antagonist', psychClass: 'Other psych agents', brands: ['Dayvigo'] }),
      medEntry({ generic: 'suvorexant dual orexin antagonist', psychClass: 'Other psych agents', brands: ['Belsomra'] }),
      medEntry({ generic: 'ramelteon melatonin agonist', psychClass: 'Other psych agents', brands: ['Rozerem'] }),
      medEntry({ generic: 'melatonin extended release', psychClass: 'Other psych agents', brands: [] }),
      medEntry({ generic: 'doxepin oral solution', psychClass: 'Other psych agents', brands: [] }),
      medEntry({ generic: 'quetiapine oral solution', psychClass: 'Other psych agents', brands: [] }),
      medEntry({ generic: 'aripiprazole oral solution', psychClass: 'Other psych agents', brands: ['Abilify Oral Solution'] }),
      medEntry({ generic: 'risperidone oral solution', psychClass: 'Other psych agents', brands: ['Risperdal Oral Solution'] }),
      medEntry({ generic: 'haloperidol oral solution', psychClass: 'Other psych agents', brands: [] }),
      medEntry({ generic: 'chlorpromazine oral solution', psychClass: 'Other psych agents', brands: [] }),
      medEntry({ generic: 'perphenazine oral solution', psychClass: 'Other psych agents', brands: [] }),
      medEntry({ generic: 'trifluoperazine oral solution', psychClass: 'Other psych agents', brands: [] }),
      medEntry({ generic: 'loxapine inhalation', psychClass: 'Other psych agents', brands: ['Adasuve'] }),
      medEntry({ generic: 'ziprasidone intramuscular', psychClass: 'Other psych agents', brands: ['Geodon IM'] }),
      medEntry({ generic: 'olanzapine intramuscular', psychClass: 'Other psych agents', brands: ['Zyprexa IM'] }),
      medEntry({ generic: 'haloperidol decanoate oral bridge', psychClass: 'Other psych agents', brands: [] }),
      medEntry({ generic: 'fluphenazine decanoate oral bridge', psychClass: 'Other psych agents', brands: [] }),
      medEntry({ generic: 'paliperidone oral bridge', psychClass: 'Other psych agents', brands: [] }),
      medEntry({ generic: 'lurasidone with food', psychClass: 'Other psych agents', brands: ['Latuda'] }),
      medEntry({ generic: 'cariprazine slow titration', psychClass: 'Other psych agents', brands: ['Vraylar'] }),
      medEntry({ generic: 'lumateperone once daily', psychClass: 'Other psych agents', brands: ['Caplyta'] }),
      medEntry({ generic: 'brexpiprazole low start', psychClass: 'Other psych agents', brands: ['Rexulti'] }),
      medEntry({ generic: 'aripiprazole partial agonist', psychClass: 'Other psych agents', brands: ['Abilify'] }),
      medEntry({ generic: 'olanzapine high metabolic risk', psychClass: 'Other psych agents', brands: ['Zyprexa'] }),
      medEntry({ generic: 'quetiapine sedating profile', psychClass: 'Other psych agents', brands: ['Seroquel'] }),
      medEntry({ generic: 'risperidone prolactin caution', psychClass: 'Other psych agents', brands: ['Risperdal'] }),
      medEntry({ generic: 'ziprasidone qtc caution', psychClass: 'Other psych agents', brands: ['Geodon'] }),
      medEntry({ generic: 'lithium narrow therapeutic index', psychClass: 'Other psych agents', brands: ['Lithobid'] }),
      medEntry({ generic: 'lamotrigine slow titration requirement', psychClass: 'Other psych agents', brands: ['Lamictal'] }),
      medEntry({ generic: 'valproate teratogenic risk', psychClass: 'Other psych agents', brands: ['Depakote'] }),
      medEntry({ generic: 'carbamazepine cyp inducer', psychClass: 'Other psych agents', brands: ['Tegretol'] }),
      medEntry({ generic: 'oxcarbazepine hyponatremia caution', psychClass: 'Other psych agents', brands: ['Trileptal'] }),
      medEntry({ generic: 'topiramate cognitive side effects', psychClass: 'Other psych agents', brands: ['Topamax'] }),
      medEntry({ generic: 'zonisamide sulfa caution', psychClass: 'Other psych agents', brands: ['Zonegran'] }),
      medEntry({ generic: 'gabapentin renal adjustment', psychClass: 'Other psych agents', brands: ['Neurontin'] }),
      medEntry({ generic: 'pregabalin edema caution', psychClass: 'Other psych agents', brands: ['Lyrica'] }),
      medEntry({ generic: 'buspirone delayed onset', psychClass: 'Other psych agents', brands: ['Buspar'] }),
      medEntry({ generic: 'propranolol performance anxiety', psychClass: 'Other psych agents', brands: ['Inderal'] }),
      medEntry({ generic: 'prazosin ptsd nightmares', psychClass: 'Other psych agents', brands: ['Minipress'] }),
    ],
  },
];

const compositeSeed = [
  medEntry({
    generic: 'amphetamine mixed salts',
    psychClass: 'Stimulant ADHD medications',
    brands: ['Adderall', 'Adderall XR', 'Mydayis'],
    aliases: ['adderall', 'adderall xr', 'mydayis'],
    formulations: [
      buildFormulation(
        'amphetamine-mixed-salts',
        'IR tablet',
        'oral',
        'tablet',
        { start: '5 mg once or twice daily', target: '20-30 mg/day divided', max: '40 mg/day (usual outpatient max)' },
        {
          titration_notes: ['Increase in 5 mg increments every 4-7 days as clinically tolerated.'],
          formulation_specific_pearls: ['Shorter duration enables flexible split dosing.'],
          administration_notes: ['Typically morning and early afternoon dosing.'],
        }
      ),
      buildFormulation(
        'amphetamine-mixed-salts',
        'XR capsule',
        'oral',
        'extended-release capsule',
        { start: '10 mg every morning', target: '20-30 mg every morning', max: '40 mg/day (outpatient typical ceiling)' },
        {
          titration_notes: ['Increase by 5-10 mg every 7 days as needed.'],
          formulation_specific_pearls: ['Smoother daytime coverage than IR split dosing.'],
          administration_notes: ['Morning dosing preferred to reduce insomnia risk.'],
        }
      ),
    ],
  }),
  medEntry({
    generic: 'methylphenidate',
    psychClass: 'Stimulant ADHD medications',
    brands: ['Ritalin', 'Concerta', 'Jornay PM', 'Azstarys'],
    aliases: ['ritalin', 'concerta', 'jornay pm', 'azstarys'],
    formulations: [
      buildFormulation(
        'methylphenidate',
        'IR tablet',
        'oral',
        'tablet',
        { start: '5 mg once or twice daily', target: '20-40 mg/day divided', max: '60 mg/day (typical outpatient limit)' },
        {
          titration_notes: ['Increase by 5-10 mg weekly based on efficacy and tolerability.'],
          administration_notes: ['Dose breakfast/lunch windows to protect sleep.'],
        }
      ),
      buildFormulation(
        'methylphenidate',
        'ER/OROS tablet',
        'oral',
        'extended-release tablet',
        { start: '18 mg every morning', target: '36-54 mg every morning', max: '72 mg/day (adult label-dependent)' },
        {
          titration_notes: ['Increase in 18 mg steps at weekly intervals.'],
          formulation_specific_pearls: ['OROS profile supports all-day symptom coverage.'],
        }
      ),
      buildFormulation(
        'methylphenidate',
        'Transdermal patch',
        'transdermal',
        'patch',
        { start: '10 mg/9 hr patch daily', target: '10-30 mg/9 hr patch daily', max: '30 mg/9 hr patch daily' },
        {
          administration_notes: ['Apply 2 hours before desired effect and rotate sites.'],
          formulation_specific_side_effect_notes: ['Patch-site irritation can occur.'],
        }
      ),
    ],
  }),
  medEntry({
    generic: 'guanfacine',
    psychClass: 'Non-stimulant ADHD medications',
    brands: ['Tenex', 'Intuniv'],
    aliases: ['tenex', 'intuniv', 'guanfacine ir', 'guanfacine er'],
    formulations: [
      buildFormulation(
        'guanfacine',
        'IR tablet',
        'oral',
        'tablet',
        { start: '0.5-1 mg at bedtime', target: '1-3 mg/day divided', max: '4 mg/day' },
        {
          titration_notes: ['Increase by 0.5-1 mg every 5-7 days.'],
          formulation_specific_pearls: ['IR often selected for bedtime hyperarousal targets.'],
        }
      ),
      buildFormulation(
        'guanfacine',
        'ER tablet',
        'oral',
        'extended-release tablet',
        { start: '1 mg every evening', target: '2-4 mg every evening', max: '7 mg/day (label-dependent)' },
        {
          titration_notes: ['Increase by 1 mg at weekly intervals.'],
          formulation_specific_pearls: ['ER offers smoother daytime carryover.'],
          administration_notes: ['Do not crush or chew ER tablets.'],
        }
      ),
    ],
  }),
  medEntry({
    generic: 'quetiapine',
    psychClass: 'Antipsychotics',
    brands: ['Seroquel', 'Seroquel XR'],
    aliases: ['seroquel', 'seroquel xr', 'quetiapine ir', 'quetiapine xr'],
    formulations: [
      buildFormulation(
        'quetiapine',
        'IR tablet',
        'oral',
        'tablet',
        { start: '25-50 mg nightly', target: '150-300 mg/day (condition-specific)', max: '800 mg/day' },
        {
          titration_notes: ['Increase by 25-50 mg every 1-3 days based on indication and sedation burden.'],
          formulation_specific_pearls: ['IR is often more sedating and useful for bedtime administration.'],
        }
      ),
      buildFormulation(
        'quetiapine',
        'XR tablet',
        'oral',
        'extended-release tablet',
        { start: '50 mg nightly', target: '150-300 mg/day (depression) or higher for bipolar/schizophrenia', max: '800 mg/day' },
        {
          titration_notes: ['Increase in 50-100 mg steps at clinically appropriate intervals.'],
          formulation_specific_pearls: ['XR may reduce daytime sedation swings for some patients.'],
          administration_notes: ['Take without splitting/crushing XR tablet.'],
        }
      ),
    ],
  }),
];

const curatedOverrides = {
  escitalopram: {
    fda_psych_uses: ['Major depressive disorder', 'Generalized anxiety disorder'],
    off_label_psych_uses: ['Panic disorder', 'Social anxiety disorder', 'OCD adjunct strategy'],
    moa_summary: 'Selective serotonin reuptake inhibitor with serotonergic enhancement.',
    common_side_effects: ['Nausea', 'Headache', 'Sexual dysfunction', 'Somnolence or activation'],
    important_risks: ['Serotonin syndrome with serotonergic combinations', 'QT caution at higher doses'],
    psych_interactions: ['Serotonergic combinations raise serotonin syndrome risk', 'Use caution with other QT-prolonging agents'],
    clinical_pearls: ['Often well tolerated first-line SSRI', 'Dose in the morning if activating, evening if sedating'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  sertraline: {
    fda_psych_uses: ['Major depressive disorder', 'OCD', 'Panic disorder', 'PTSD', 'Social anxiety disorder'],
    off_label_psych_uses: ['Generalized anxiety disorder'],
    moa_summary: 'Selective serotonin reuptake inhibitor with broad anxiety-spectrum utility.',
    common_side_effects: ['GI upset', 'Diarrhea', 'Insomnia', 'Sexual dysfunction'],
    important_risks: ['Serotonin syndrome risk', 'Activation in early titration'],
    psych_interactions: ['MAOI contraindication window applies', 'Watch additive serotonergic burden'],
    clinical_pearls: ['High-yield SSRI for trauma and anxiety disorders', 'Take with food when GI effects are prominent'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  fluoxetine: {
    fda_psych_uses: ['Major depressive disorder', 'OCD', 'Panic disorder', 'Bulimia nervosa'],
    off_label_psych_uses: ['PTSD', 'Premenstrual dysphoric disorder symptom clusters'],
    moa_summary: 'SSRI with long half-life and active metabolite.',
    common_side_effects: ['Activation', 'Insomnia', 'GI upset', 'Sexual dysfunction'],
    important_risks: ['Can worsen anxiety early in treatment', 'Long half-life prolongs interaction washout'],
    psych_interactions: ['CYP2D6 inhibition can alter co-medication exposure', 'Serotonergic combinations increase risk'],
    clinical_pearls: ['Useful when adherence is inconsistent due long half-life', 'Often more activating than other SSRIs'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  venlafaxine: {
    fda_psych_uses: ['Major depressive disorder', 'Generalized anxiety disorder', 'Social anxiety disorder', 'Panic disorder'],
    off_label_psych_uses: ['PTSD', 'Neuropathic pain adjunct strategy'],
    moa_summary: 'Serotonin-norepinephrine reuptake inhibitor with dose-related noradrenergic effect.',
    common_side_effects: ['Nausea', 'Sweating', 'Insomnia', 'Blood pressure increase'],
    important_risks: ['Discontinuation sensitivity', 'Hypertension risk at higher doses'],
    psych_interactions: ['Monitor serotonergic burden', 'Blood pressure and pulse tracking recommended'],
    clinical_pearls: ['Often effective for anxious depression', 'Taper gradually to reduce discontinuation effects'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  duloxetine: {
    fda_psych_uses: ['Major depressive disorder', 'Generalized anxiety disorder'],
    off_label_psych_uses: ['PTSD', 'Pain-predominant anxiety/depression presentations'],
    moa_summary: 'SNRI with balanced serotonergic and noradrenergic activity and pain utility.',
    common_side_effects: ['Nausea', 'Dry mouth', 'Sweating', 'Constipation'],
    important_risks: ['Hepatic caution', 'Discontinuation symptoms if abrupt stop'],
    psych_interactions: ['Serotonergic caution with combinations', 'CYP interactions can influence exposure'],
    clinical_pearls: ['Useful when pain symptoms are comorbid', 'Take with food during early titration'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  bupropion: {
    fda_psych_uses: ['Major depressive disorder', 'Seasonal affective disorder'],
    off_label_psych_uses: ['ADHD adjunct', 'SSRI sexual side effect mitigation strategy'],
    moa_summary: 'Norepinephrine-dopamine reuptake inhibition without primary serotonergic effect.',
    common_side_effects: ['Insomnia', 'Dry mouth', 'Tremor', 'Anxiety or activation'],
    important_risks: ['Seizure threshold lowering', 'Avoid in active eating disorder history'],
    psych_interactions: ['CYP2D6 inhibition can affect co-prescribed drugs', 'Activation risk with stimulants'],
    clinical_pearls: ['Often lower sexual side effect burden', 'Morning dosing helps reduce insomnia'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  'dextromethorphan-bupropion': {
    fda_psych_uses: ['Major depressive disorder'],
    off_label_psych_uses: [],
    moa_summary: 'NMDA receptor modulation and sigma-1 activity with bupropion metabolic support.',
    common_side_effects: ['Dizziness', 'Nausea', 'Somnolence', 'Dry mouth'],
    important_risks: ['Seizure threshold and blood pressure cautions', 'Serotonergic and dissociative adverse effect considerations'],
    psych_interactions: ['Avoid with MAOI', 'Monitor serotonergic co-prescribing risk'],
    clinical_pearls: ['Can be useful when rapid symptom shift is prioritized', 'Review CYP2D6 interactions carefully'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  'lithium-carbonate': {
    fda_psych_uses: ['Bipolar disorder (acute mania and maintenance)'],
    off_label_psych_uses: ['Major depression augmentation', 'Suicide risk reduction strategy'],
    moa_summary: 'Second-messenger and neurotransmission modulation with mood-stabilizing effects.',
    common_side_effects: ['Tremor', 'Polyuria', 'Thirst', 'GI upset'],
    important_risks: ['Narrow therapeutic index and toxicity risk', 'Renal and thyroid adverse effects'],
    psych_interactions: ['NSAIDs, ACE inhibitors, and diuretics may increase lithium levels', 'Dehydration increases toxicity risk'],
    clinical_pearls: ['Routine level/lab monitoring required', 'Split dosing can improve tolerability'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  lamotrigine: {
    fda_psych_uses: ['Bipolar disorder maintenance'],
    off_label_psych_uses: ['Bipolar depression support', 'Treatment-resistant depression augmentation'],
    moa_summary: 'Voltage-gated sodium channel modulation with glutamatergic dampening.',
    common_side_effects: ['Headache', 'Nausea', 'Dizziness', 'Insomnia'],
    important_risks: ['Serious rash risk with rapid titration', 'Dose changes needed with valproate or enzyme inducers'],
    psych_interactions: ['Valproate increases lamotrigine exposure', 'Oral contraceptive changes can alter levels'],
    clinical_pearls: ['Slow titration is required', 'Often weight-neutral and cognitively tolerable'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  divalproex: {
    fda_psych_uses: ['Bipolar disorder (acute mania)'],
    off_label_psych_uses: ['Mood lability support', 'Aggression/irritability adjunct strategy'],
    moa_summary: 'Increases GABA signaling with broad neuronal stabilization effects.',
    common_side_effects: ['Weight gain', 'Sedation', 'Tremor', 'GI upset'],
    important_risks: ['Teratogenicity', 'Hepatotoxicity and pancreatitis warning'],
    psych_interactions: ['Can increase lamotrigine levels and rash risk', 'CNS depressant additive burden'],
    clinical_pearls: ['Baseline and interval labs are essential', 'Consider metabolic monitoring over time'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  aripiprazole: {
    fda_psych_uses: ['Schizophrenia', 'Bipolar I disorder', 'Adjunctive treatment of major depressive disorder'],
    off_label_psych_uses: ['Irritability/impulsivity adjunct in selected cases'],
    moa_summary: 'D2/5-HT1A partial agonist and 5-HT2A antagonist atypical antipsychotic.',
    common_side_effects: ['Akathisia', 'Insomnia', 'Nausea', 'Restlessness'],
    important_risks: ['EPS/akathisia', 'Metabolic adverse effect burden still possible'],
    psych_interactions: ['Strong CYP2D6/CYP3A4 modifiers may require dose adjustment'],
    clinical_pearls: ['High-yield depression augmentation option', 'Often less sedating than other atypicals'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  'quetiapine-ir': {
    fda_psych_uses: ['Schizophrenia', 'Bipolar disorder'],
    off_label_psych_uses: ['Insomnia adjunct strategy', 'Anxiety adjunct strategy'],
    moa_summary: 'Multi-receptor atypical antipsychotic with sedating profile at lower doses.',
    common_side_effects: ['Sedation', 'Orthostasis', 'Dry mouth', 'Weight gain'],
    important_risks: ['Metabolic syndrome risk', 'QT caution and orthostatic falls'],
    psych_interactions: ['CNS depressant additive burden', 'CYP3A4 inhibitors can raise levels'],
    clinical_pearls: ['Sedation can be leveraged at bedtime', 'Monitor metabolic trajectory early'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  'quetiapine-xr': {
    fda_psych_uses: ['Schizophrenia', 'Bipolar disorder', 'Adjunctive treatment of major depressive disorder'],
    off_label_psych_uses: ['Generalized anxiety disorder adjunct use in selected patients'],
    moa_summary: 'Extended-release quetiapine profile with smoother daytime exposure.',
    common_side_effects: ['Sedation', 'Dizziness', 'Dry mouth', 'Weight gain'],
    important_risks: ['Metabolic burden', 'Orthostasis and QT caution'],
    psych_interactions: ['CYP3A4 interaction sensitivity', 'Additive CNS depressant effects'],
    clinical_pearls: ['XR can simplify once-daily dosing', 'Evening administration often improves tolerability'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  quetiapine: {
    fda_psych_uses: ['Schizophrenia', 'Bipolar disorder', 'MDD adjunct (XR)'],
    off_label_psych_uses: ['Insomnia and anxiety adjunct use in selected cases'],
    moa_summary: 'Atypical antipsychotic with formulation-specific sedation and kinetic profiles.',
    common_side_effects: ['Sedation', 'Orthostasis', 'Dry mouth', 'Weight gain'],
    important_risks: ['Metabolic syndrome risk', 'QT and orthostatic caution'],
    psych_interactions: ['CYP3A4 interaction sensitivity', 'Additive CNS depression with sedatives'],
    clinical_pearls: ['IR and XR forms can feel clinically different for onset and daytime carryover.'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  lumateperone: {
    fda_psych_uses: ['Schizophrenia', 'Bipolar depression'],
    off_label_psych_uses: ['Mood-spectrum augmentation in selected scenarios'],
    moa_summary: 'Serotonin, dopamine, and glutamatergic modulation with low-dose once daily use.',
    common_side_effects: ['Somnolence', 'Dry mouth', 'Dizziness', 'Nausea'],
    important_risks: ['Class antipsychotic boxed warnings apply', 'Orthostatic caution'],
    psych_interactions: ['CYP3A4 interactions may require adjustment', 'Additive CNS depressant effects'],
    clinical_pearls: ['Generally favorable EPS profile', 'Useful modern outpatient bipolar option'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  'amphetamine-mixed-salts-ir': {
    fda_psych_uses: ['ADHD'],
    off_label_psych_uses: ['Residual cognitive symptoms in selected mood disorders (specialist use)'],
    moa_summary: 'Catecholamine release enhancement and reuptake inhibition stimulant.',
    common_side_effects: ['Decreased appetite', 'Insomnia', 'Dry mouth', 'Increased heart rate'],
    important_risks: ['Blood pressure/heart rate elevation', 'Misuse and diversion risk'],
    psych_interactions: ['MAOI contraindication window applies', 'Activation risk with other stimulating agents'],
    clinical_pearls: ['IR allows flexible split dosing', 'Assess baseline cardiovascular risk and follow-up vitals'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  'amphetamine-mixed-salts-xr': {
    fda_psych_uses: ['ADHD'],
    off_label_psych_uses: [],
    moa_summary: 'Extended-release mixed amphetamine salts for all-day symptom coverage.',
    common_side_effects: ['Appetite suppression', 'Insomnia', 'Dry mouth', 'Anxiety'],
    important_risks: ['Cardiovascular activation', 'Misuse and diversion risk'],
    psych_interactions: ['MAOI contraindication', 'Caution with other sympathomimetics'],
    clinical_pearls: ['Useful for once-daily coverage', 'Dose timing affects sleep quality'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  'amphetamine-mixed-salts': {
    fda_psych_uses: ['ADHD'],
    off_label_psych_uses: [],
    moa_summary: 'Mixed amphetamine stimulant where IR and XR forms are selected by coverage goals.',
    common_side_effects: ['Appetite suppression', 'Insomnia', 'Dry mouth', 'BP/HR activation'],
    important_risks: ['Cardiovascular activation', 'Misuse/diversion risk'],
    psych_interactions: ['MAOI contraindication', 'Activation burden with other sympathomimetics'],
    clinical_pearls: ['Formulation choice is central; do not treat IR and XR as interchangeable dosing.'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  lisdexamfetamine: {
    fda_psych_uses: ['ADHD', 'Binge eating disorder'],
    off_label_psych_uses: [],
    moa_summary: 'Prodrug stimulant converted to dextroamphetamine for smoother exposure profile.',
    common_side_effects: ['Appetite loss', 'Insomnia', 'Dry mouth', 'Irritability'],
    important_risks: ['BP/HR activation', 'Misuse potential despite prodrug design'],
    psych_interactions: ['MAOI contraindication', 'Activation with other stimulating medications'],
    clinical_pearls: ['Often perceived as smoother onset/offset', 'Morning dosing usually best for sleep protection'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  methylphenidate: {
    fda_psych_uses: ['ADHD'],
    off_label_psych_uses: [],
    moa_summary: 'Catecholamine reuptake inhibition stimulant with IR/ER/patch formulation pathways.',
    common_side_effects: ['Appetite suppression', 'Insomnia', 'Anxiety', 'Headache'],
    important_risks: ['Blood pressure and pulse activation', 'Misuse/diversion risk'],
    psych_interactions: ['MAOI contraindication', 'Activation burden with other stimulating therapies'],
    clinical_pearls: ['Select formulation based on daily functional schedule and sleep sensitivity.'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  viloxazine: {
    fda_psych_uses: ['ADHD'],
    off_label_psych_uses: [],
    moa_summary: 'Norepinephrine-modulating non-stimulant with serotonergic effects.',
    common_side_effects: ['Somnolence', 'Fatigue', 'Nausea', 'Decreased appetite'],
    important_risks: ['Suicidality monitoring in younger populations', 'Blood pressure and pulse changes'],
    psych_interactions: ['CYP1A2 inhibition can alter co-med levels', 'Monitor activation and sleep changes'],
    clinical_pearls: ['Useful non-stimulant alternative when stimulant side effects are limiting'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  'guanfacine-er': {
    fda_psych_uses: ['ADHD'],
    off_label_psych_uses: ['Anxiety and hyperarousal adjunct strategy'],
    moa_summary: 'Alpha-2A agonist with prefrontal modulation and calming effects.',
    common_side_effects: ['Sedation', 'Fatigue', 'Dizziness', 'Dry mouth'],
    important_risks: ['Hypotension and bradycardia', 'Rebound symptoms if abrupt discontinuation'],
    psych_interactions: ['Additive sedation with CNS depressants', 'Monitor BP with antihypertensives'],
    clinical_pearls: ['Evening dosing can improve daytime sedation burden', 'Taper gradually if discontinuing'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  guanfacine: {
    fda_psych_uses: ['ADHD'],
    off_label_psych_uses: ['Hyperarousal and sleep-onset support in selected patients'],
    moa_summary: 'Alpha-2A agonist where IR and ER dosing strategy differs materially.',
    common_side_effects: ['Sedation', 'Fatigue', 'Dizziness', 'Dry mouth'],
    important_risks: ['Hypotension and bradycardia', 'Rebound symptoms if abruptly stopped'],
    psych_interactions: ['Additive hypotension/sedation with CNS depressants or antihypertensives'],
    clinical_pearls: ['IR and ER are not milligram-for-milligram substitutes.'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  buspirone: {
    fda_psych_uses: ['Generalized anxiety disorder'],
    off_label_psych_uses: ['SSRI augmentation for anxiety-spectrum symptoms'],
    moa_summary: '5-HT1A partial agonist anxiolytic without benzodiazepine receptor effects.',
    common_side_effects: ['Dizziness', 'Headache', 'Nausea', 'Restlessness'],
    important_risks: ['Delayed onset may reduce early adherence', 'Serotonergic caution with combination therapy'],
    psych_interactions: ['CYP3A4 inhibitors can increase exposure', 'Serotonergic combinations may increase adverse effect risk'],
    clinical_pearls: ['Usually dosed BID-TID', 'Useful when avoiding benzodiazepines'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  propranolol: {
    fda_psych_uses: [],
    off_label_psych_uses: ['Performance anxiety', 'Somatic anxiety symptom control', 'Akathisia adjunct strategy'],
    moa_summary: 'Non-selective beta blockade reducing peripheral adrenergic symptoms.',
    common_side_effects: ['Fatigue', 'Dizziness', 'Bradycardia', 'Cold extremities'],
    important_risks: ['Hypotension/bradycardia', 'Can mask hypoglycemia and worsen asthma'],
    psych_interactions: ['Additive hypotension with other antihypertensives', 'Monitor with sedating agents'],
    clinical_pearls: ['Useful PRN for predictable performance anxiety', 'Track pulse/BP at dose changes'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
  'naltrexone-oral': {
    fda_psych_uses: [],
    off_label_psych_uses: ['Alcohol use disorder support', 'Craving reduction support'],
    moa_summary: 'Opioid receptor antagonism reducing reward reinforcement and craving.',
    common_side_effects: ['Nausea', 'Headache', 'Fatigue', 'Anxiety'],
    important_risks: ['Hepatic enzyme elevation risk', 'Opioid blockade implications for acute pain care'],
    psych_interactions: ['Contraindicated with active opioid use', 'Coordinate perioperative pain plans'],
    clinical_pearls: ['Confirm opioid-free interval before initiation', 'Track liver enzymes with ongoing therapy'],
    content_review_status: 'curated',
    editorial_last_reviewed: new Date().toISOString(),
  },
};

function mergeMedication(sourceMed, curatedMed) {
  if (!curatedMed) return sourceMed;

  const merged = {
    ...sourceMed,
    ...curatedMed,
  };

  if (curatedMed.formulations) {
    merged.formulations = curatedMed.formulations;
  }

  merged.source_links = Array.from(new Set([
    ...(sourceMed.source_links || []),
    ...(curatedMed.source_links || []),
  ]));

  if (!curatedMed.content_review_status) {
    merged.content_review_status = 'curated';
  }

  const missingFlags = [];
  if (!merged.fda_psych_uses || !merged.fda_psych_uses.length) missingFlags.push('fda psych uses');
  if (!merged.off_label_psych_uses || !merged.off_label_psych_uses.length) missingFlags.push('off-label psych uses');
  if (!merged.common_side_effects || !merged.common_side_effects.length) missingFlags.push('common side effects');
  if (!merged.psych_interactions || !merged.psych_interactions.length) missingFlags.push('psych interactions');
  if (!merged.clinical_pearls || !merged.clinical_pearls.length) missingFlags.push('clinical pearls');
  merged.missing_data_flags = missingFlags;

  return merged;
}

const PSYCH_TERM_REGEX = /(depress|anxiety|panic|ocd|bipolar|schizo|psych|ptsd|adhd|attention|autism|mania|insomnia|sleep|substance|alcohol|opioid|mood|agitation|irritab|obsess|compuls)/i;
const PLACEHOLDER_TEXT_REGEX = /(no summary available yet|no curated summary available yet|pending review|verify official source)/i;

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function normalizeSnippet(value, maxLength = 180) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function normalizeList(value, maxItems = 6, maxLength = 180) {
  const items = toArray(value)
    .map((entry) => normalizeSnippet(entry, maxLength))
    .filter(Boolean);
  return Array.from(new Set(items)).slice(0, maxItems);
}

function isMeaningfulText(value) {
  const text = normalizeSnippet(value, 260);
  return Boolean(text) && !PLACEHOLDER_TEXT_REGEX.test(text);
}

function deriveSourceFallback(sourceMed) {
  const enrichment = sourceMed && sourceMed.source_enrichment ? sourceMed.source_enrichment : {};
  const openfda = enrichment.openfda || {};

  const indications = normalizeList(openfda.indications_and_usage, 8, 200);
  const psychIndications = indications.filter((item) => PSYCH_TERM_REGEX.test(item));

  return {
    source_enrichment: enrichment,
    fda_psych_uses: (psychIndications.length ? psychIndications : indications).slice(0, 6),
    psych_interactions: normalizeList(openfda.drug_interactions, 6, 180),
    common_side_effects: normalizeList(openfda.adverse_reactions, 6, 160),
    important_risks: normalizeList([...(openfda.boxed_warning || []), ...(openfda.warnings || [])], 6, 180),
    moa_summary: normalizeList(openfda.mechanism_of_action, 1, 220)[0] || '',
    dosing_snippets: normalizeList(openfda.dosage_and_administration, 2, 180),
  };
}

function applySourceFallback(merged, sourceFallback) {
  let used = false;

  if ((!merged.fda_psych_uses || !merged.fda_psych_uses.length) && sourceFallback.fda_psych_uses.length) {
    merged.fda_psych_uses = sourceFallback.fda_psych_uses;
    used = true;
  }

  if ((!merged.psych_interactions || !merged.psych_interactions.length) && sourceFallback.psych_interactions.length) {
    merged.psych_interactions = sourceFallback.psych_interactions;
    used = true;
  }

  if ((!merged.common_side_effects || !merged.common_side_effects.length) && sourceFallback.common_side_effects.length) {
    merged.common_side_effects = sourceFallback.common_side_effects;
    used = true;
  }

  if ((!merged.important_risks || !merged.important_risks.length) && sourceFallback.important_risks.length) {
    merged.important_risks = sourceFallback.important_risks;
    used = true;
  }

  if (!isMeaningfulText(merged.moa_summary) && sourceFallback.moa_summary) {
    merged.moa_summary = sourceFallback.moa_summary;
    used = true;
  }

  if (Array.isArray(merged.formulations) && sourceFallback.dosing_snippets.length) {
    merged.formulations = merged.formulations.map((formulation) => {
      const dosing = formulation.common_adult_psych_dosing || {};
      const nextDosing = { ...dosing };
      let nextUsed = false;

      if (!isMeaningfulText(nextDosing.start)) {
        nextDosing.start = sourceFallback.dosing_snippets[0];
        nextUsed = true;
      }
      if (!isMeaningfulText(nextDosing.target)) {
        nextDosing.target = sourceFallback.dosing_snippets[0];
        nextUsed = true;
      }
      if (!isMeaningfulText(nextDosing.max)) {
        nextDosing.max = sourceFallback.dosing_snippets[1] || 'See source dosing text';
        nextUsed = true;
      }

      if (nextUsed) used = true;

      return {
        ...formulation,
        common_adult_psych_dosing: nextDosing,
      };
    });
  }

  merged.source_enrichment = sourceFallback.source_enrichment || {};
  merged.source_derived_fallback_used = used;
}

function buildMissingDataFlags(medication) {
  const flags = [];
  if (!medication.fda_psych_uses || !medication.fda_psych_uses.length) flags.push('fda psych uses');
  if (!medication.off_label_psych_uses || !medication.off_label_psych_uses.length) flags.push('off-label psych uses');
  if (!medication.common_side_effects || !medication.common_side_effects.length) flags.push('common side effects');
  if (!medication.psych_interactions || !medication.psych_interactions.length) flags.push('psych interactions');
  if (!medication.clinical_pearls || !medication.clinical_pearls.length) flags.push('clinical pearls');
  if (!isMeaningfulText(medication.moa_summary)) flags.push('mechanism summary');
  return flags;
}

function computeReliability(medication, sourceMed) {
  const enrichment = sourceMed && sourceMed.source_enrichment ? sourceMed.source_enrichment : {};
  const sourceSignals = [];
  let score = 0;

  if (enrichment.dailymed && enrichment.dailymed.found) {
    score += 38;
    sourceSignals.push('DailyMed');
  }
  if (enrichment.openfda && enrichment.openfda.found) {
    score += 32;
    sourceSignals.push('openFDA');
  }
  if (enrichment.drugsfda && enrichment.drugsfda.found) {
    score += 22;
    sourceSignals.push('Drugs@FDA');
  }
  if (enrichment.rxnorm && enrichment.rxnorm.found) {
    score += 12;
    sourceSignals.push('RxNorm');
  }

  let coverageBoost = 0;
  if ((medication.fda_psych_uses || []).length) coverageBoost += 4;
  if ((medication.off_label_psych_uses || []).length) coverageBoost += 2;
  if ((medication.common_side_effects || []).length) coverageBoost += 3;
  if ((medication.psych_interactions || []).length) coverageBoost += 3;
  if ((medication.important_risks || []).length) coverageBoost += 3;
  if ((medication.clinical_pearls || []).length) coverageBoost += 2;
  if (isMeaningfulText(medication.moa_summary)) coverageBoost += 3;

  const hasDosing = Array.isArray(medication.formulations) && medication.formulations.some((formulation) => {
    const dosing = formulation.common_adult_psych_dosing || {};
    return isMeaningfulText(dosing.start) || isMeaningfulText(dosing.target) || isMeaningfulText(dosing.max);
  });
  if (hasDosing) coverageBoost += 3;

  score += Math.min(20, coverageBoost);

  if (medication.content_review_status === 'curated') {
    score = Math.max(score, 92);
  }

  score = Math.min(100, Math.max(0, Math.round(score)));

  let tier = 'low';
  if (score >= 90) {
    tier = 'very-high';
  } else if (score >= 70) {
    tier = 'high';
  } else if (score >= 45) {
    tier = 'moderate';
  }

  return {
    score,
    tier,
    sources: sourceSignals,
    coverage_boost: Math.min(20, coverageBoost),
  };
}

function dedupeById(records) {
  const map = new Map();
  records.forEach((record) => {
    if (!map.has(record.id)) {
      map.set(record.id, record);
    }
  });
  return Array.from(map.values());
}

function loadExistingSourceMap() {
  if (!fs.existsSync(SOURCE_PATH)) return new Map();

  try {
    const payload = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf8'));
    const meds = Array.isArray(payload.medications) ? payload.medications : [];
    return new Map(meds.map((med) => [med.id, med]));
  } catch (error) {
    return new Map();
  }
}

const existingSourceMap = loadExistingSourceMap();

const sourceRecords = dedupeById([
  ...groupedSeed.flatMap((group) => group.meds),
  ...compositeSeed,
]).map((seedMed) => {
  const existing = existingSourceMap.get(seedMed.id);
  if (!existing) return seedMed;

  return {
    ...seedMed,
    brand_names: Array.from(new Set([...(seedMed.brand_names || []), ...(existing.brand_names || [])])),
    aliases: Array.from(new Set([...(seedMed.aliases || []), ...(existing.aliases || [])])),
    source_links: Array.from(new Set([...(existing.source_links || []), ...(seedMed.source_links || [])])),
    source_last_checked: existing.source_last_checked || seedMed.source_last_checked || null,
    source_enrichment: existing.source_enrichment || seedMed.source_enrichment || {},
    content_review_status: existing.content_review_status && existing.content_review_status !== 'curated'
      ? existing.content_review_status
      : seedMed.content_review_status,
  };
});

const curatedRecords = Object.entries(curatedOverrides).map(([id, value]) => ({ id, ...value }));
const curatedMap = new Map(curatedRecords.map((record) => [record.id, record]));

const compiledRecords = sourceRecords.map((sourceMed) => {
  const curated = curatedMap.get(sourceMed.id);
  const merged = mergeMedication(sourceMed, curated);
  const sourceFallback = deriveSourceFallback(sourceMed);

  applySourceFallback(merged, sourceFallback);
  merged.missing_data_flags = buildMissingDataFlags(merged);

  if (merged.content_review_status !== 'curated') {
    merged.content_review_status = 'source scored';
  }

  const reliability = computeReliability(merged, sourceMed);
  merged.reliability_score = reliability.score;
  merged.reliability_tier = reliability.tier;
  merged.reliability_sources = reliability.sources;
  merged.reliability_coverage_boost = reliability.coverage_boost;

  return merged;
});

const generatedAt = new Date().toISOString();

const sourcePayload = {
  generated_at: generatedAt,
  source_policy: 'source-derived metadata only; curated narrative fields merged when available',
  medications: sourceRecords,
};

const curatedPayload = {
  generated_at: generatedAt,
  editorial_policy: 'high-priority curated psychiatric summaries with reliability scoring for all records',
  medications: curatedRecords,
};

const reliabilityStats = compiledRecords.reduce((acc, record) => {
  const tier = String(record.reliability_tier || 'low').toLowerCase();
  if (tier === 'very-high') {
    acc.very_high += 1;
  } else if (tier === 'high') {
    acc.high += 1;
  } else if (tier === 'moderate') {
    acc.moderate += 1;
  } else {
    acc.low += 1;
  }
  return acc;
}, {
  very_high: 0,
  high: 0,
  moderate: 0,
  low: 0,
});

const compiledPayload = {
  generated_at: generatedAt,
  source_hierarchy: ['DailyMed', 'openFDA', 'Drugs@FDA', 'RxNorm/RxNav'],
  medications: compiledRecords,
  stats: {
    total: compiledRecords.length,
    curated: compiledRecords.filter((record) => record.content_review_status === 'curated').length,
    source_scored: compiledRecords.filter((record) => record.content_review_status !== 'curated').length,
    pending_review: compiledRecords.filter((record) => (record.missing_data_flags || []).length > 0).length,
    reliability: reliabilityStats,
    missing_fields: compiledRecords.filter((record) => (record.missing_data_flags || []).length > 0).length,
  },
};

const reviewPayload = {
  generated_at: generatedAt,
  review_queue: compiledRecords
    .filter((record) => {
      const tier = String(record.reliability_tier || 'low').toLowerCase();
      const score = Number(record.reliability_score || 0);
      return (record.missing_data_flags || []).length > 0 || tier === 'low' || score < 75;
    })
    .map((record) => ({
      id: record.id,
      generic_name: record.generic_name,
      psych_class: record.psych_class,
      missing_data_flags: record.missing_data_flags,
      content_review_status: record.content_review_status,
      reliability_score: record.reliability_score || 0,
      reliability_tier: record.reliability_tier || 'low',
      reliability_sources: record.reliability_sources || [],
    })),
};

fs.writeFileSync(SOURCE_PATH, JSON.stringify(sourcePayload, null, 2));
fs.writeFileSync(CURATED_PATH, JSON.stringify(curatedPayload, null, 2));
fs.writeFileSync(COMPILED_PATH, JSON.stringify(compiledPayload, null, 2));
fs.writeFileSync(REVIEW_PATH, JSON.stringify(reviewPayload, null, 2));

console.log(`Compiled medication catalog with ${compiledRecords.length} records.`);
console.log(`Curated records: ${compiledPayload.stats.curated}`);
console.log(`Reliability tiers: ${JSON.stringify(compiledPayload.stats.reliability)}`);
console.log(`Pending review records: ${compiledPayload.stats.pending_review}`);
