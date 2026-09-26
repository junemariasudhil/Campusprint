import type { Binding, ColourMode, PriceBreakdown, PrintRate, Sides, Stapling } from '@/types'

function ratePerPage(rates: PrintRate, colourMode: ColourMode, sides: Sides): number {
  if (colourMode === 'BW') {
    return sides === 'SINGLE' ? rates.bw_single_page : rates.bw_double_page
  }
  return sides === 'SINGLE' ? rates.colour_single_page : rates.colour_double_page
}

function bindingFee(rates: PrintRate, binding: Binding): number {
  switch (binding) {
    case 'SOFT_SPIRAL':
      return rates.soft_spiral_bind_fee
    case 'HARD_SPIRAL':
      return rates.hard_spiral_bind_fee
    default:
      return 0
  }
}

export interface PricingInput {
  pageCount: number
  copies: number
  colourMode: ColourMode
  sides: Sides
  stapling: Stapling
  binding: Binding
  priority: boolean
}

export function calculatePrice(rates: PrintRate, input: PricingInput): PriceBreakdown {
  const perPageRate = ratePerPage(rates, input.colourMode, input.sides)
  const basePrice = input.pageCount * input.copies * perPageRate

  const stapleFee = input.stapling === 'STAPLE' ? rates.staple_fee : 0
  const finishingPrice = (stapleFee + bindingFee(rates, input.binding)) * input.copies

  const priorityFee = input.priority ? (basePrice + finishingPrice) * rates.priority_percentage : 0

  const totalPrice = basePrice + finishingPrice + priorityFee

  return {
    basePrice: round2(basePrice),
    finishingPrice: round2(finishingPrice),
    priorityFee: round2(priorityFee),
    totalPrice: round2(totalPrice),
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}
