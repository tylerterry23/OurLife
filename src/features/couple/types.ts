export type RelationshipStatus =
  | 'dating'
  | 'engaged'
  | 'married'
  | 'situationship'
  | 'its_complicated'

export const relationshipStatusLabels: Record<RelationshipStatus, string> = {
  dating: 'Dating',
  engaged: 'Engaged',
  married: 'Married',
  situationship: 'Situationship',
  its_complicated: "It's complicated",
}

export const relationshipStatusOptions = Object.keys(
  relationshipStatusLabels
) as RelationshipStatus[]
