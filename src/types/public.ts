export type PublicBranch = {
  id: string
  name: string
  departmentName: string
}

export type PublicService = {
  serviceId: string
  serviceName: string
  abbreviation: string
  serviceCode: string
}

export type PublicQueueJoinPayload = {
  branchId: string
  serviceId: string
}
