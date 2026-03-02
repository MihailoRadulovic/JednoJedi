import type { Mode, PlanType, Goal } from '@prisma/client'

export type { Mode, PlanType, Goal }

export type MealTypeKey = 'dorucak' | 'uzina' | 'rucak' | 'vecera'
export type DifficultyKey = 'lako' | 'srednje' | 'tesko'
export type IngredientCategory = 'meso' | 'povrce' | 'mlecni' | 'zacini' | 'zitarice' | 'ostalo'

export interface RecipeWithIngredients {
  id: string
  name: string
  mealTypes: string[]
  prepTime: number
  difficulty: string
  calories: number
  protein: number
  fat: number
  carbs: number
  tags: string[]
  steps: string[]
  ingredients: {
    amount: number
    ingredient: {
      id: string
      name: string
      unit: string
      nationalPrice: number
      category: string
    }
  }[]
}

export interface PlanGenerationParams {
  type: PlanType
  goal: Goal
  persons: number
  budget?: number
  targetCals?: number
  excludedIngredients?: string[]
  preferredIngredients?: string[]
  region?: string
}
