export const deptEnum = [
  { value: 1, label: '研发部' },
  { value: 2, label: '产品部' },
  { value: 3, label: '测试部' },
  { value: 4, label: '运营部' },
  { value: 5, label: '财务部' },
]

export const roleEnum = [
  { value: 'admin', label: '系统管理员' },
  { value: 'leader', label: '部门负责人' },
  { value: 'member', label: '普通成员' },
]

export const statusEnum = [
  { value: 1, label: '启用' },
  { value: 0, label: '禁用' },
]

export const genderEnum = [
  { value: 'M', label: '男' },
  { value: 'F', label: '女' },
]

export const sourceEnum = [
  { value: 'web', label: '官网注册' },
  { value: 'wechat', label: '微信导入' },
  { value: 'admin', label: '后台创建' },
]

const currentYear = new Date().getFullYear()

const createMockUsers = count => {
  return Array.from({ length: count }, (_, idx) => {
    const index = idx + 1
    const deptId = (index % deptEnum.length) + 1
    const roleCode = roleEnum[index % roleEnum.length].value
    const status = index % 4 === 0 ? 0 : 1
    const createDay = String((index % 28) + 1).padStart(2, '0')
    const loginDay = String(((index + 9) % 28) + 1).padStart(2, '0')
    const updateDay = String(((index + 5) % 28) + 1).padStart(2, '0')
    const createHour = String((index % 10) + 8).padStart(2, '0')
    const loginHour = String((index % 10) + 9).padStart(2, '0')
    const updateHour = String((index % 10) + 10).padStart(2, '0')
    const gender = index % 2 === 0 ? 'M' : 'F'
    const source = sourceEnum[index % sourceEnum.length].value
    return {
      userId: 1000 + index,
      username: `user_${String(index).padStart(3, '0')}`,
      nickName: `测试用户${index}`,
      email: `user${index}@example.com`,
      gender,
      phone: `1380000${String(index).padStart(4, '0')}`,
      jobNo: `JOB${String(5000 + index)}`,
      loginIp: `10.10.${index % 20}.${(index % 250) + 1}`,
      registerSource: source,
      deptId,
      roleCode,
      status,
      lastLoginTime: `${currentYear}-03-${loginDay} ${loginHour}:20:00`,
      createTime: `${currentYear}-02-${createDay} ${createHour}:00:00`,
      updateTime: `${currentYear}-03-${updateDay} ${updateHour}:30:00`,
      creator: index % 3 === 0 ? 'system' : 'admin',
      updater: index % 2 === 0 ? 'admin' : 'operator',
      remark: `第${index}条模拟用户数据`,
    }
  })
}

const allUsers = createMockUsers(120)

export const queryMockUsers = params => {
  const {
    pageNum = 1,
    pageSize = 10,
    username,
    nickName,
    email,
    gender,
    phone,
    jobNo,
    loginIp,
    registerSource,
    deptId,
    roleCode,
    status,
    createTimeStart,
    createTimeEnd,
    updateTimeStart,
    updateTimeEnd,
    creator,
    updater,
  } = params ?? {}

  let filtered = allUsers.filter(item => {
    const usernameMatched = username ? item.username.includes(String(username)) : true
    const nickNameMatched = nickName ? item.nickName.includes(String(nickName)) : true
    const emailMatched = email ? item.email.includes(String(email)) : true
    const genderMatched = gender ? item.gender === String(gender) : true
    const phoneMatched = phone ? item.phone.includes(String(phone)) : true
    const jobNoMatched = jobNo ? item.jobNo.includes(String(jobNo)) : true
    const loginIpMatched = loginIp ? item.loginIp.includes(String(loginIp)) : true
    const sourceMatched = registerSource ? item.registerSource === String(registerSource) : true
    const deptMatched = deptId !== undefined && deptId !== '' ? item.deptId === Number(deptId) : true
    const roleMatched = roleCode ? item.roleCode === String(roleCode) : true
    const statusMatched = status !== undefined && status !== '' ? item.status === Number(status) : true
    const startMatched = createTimeStart ? item.createTime >= String(createTimeStart) : true
    const endMatched = createTimeEnd ? item.createTime <= String(createTimeEnd) : true
    const updateStartMatched = updateTimeStart ? item.updateTime >= String(updateTimeStart) : true
    const updateEndMatched = updateTimeEnd ? item.updateTime <= String(updateTimeEnd) : true
    const creatorMatched = creator ? item.creator.includes(String(creator)) : true
    const updaterMatched = updater ? item.updater.includes(String(updater)) : true
    return usernameMatched
      && nickNameMatched
      && emailMatched
      && genderMatched
      && phoneMatched
      && jobNoMatched
      && loginIpMatched
      && sourceMatched
      && deptMatched
      && roleMatched
      && statusMatched
      && startMatched
      && endMatched
      && updateStartMatched
      && updateEndMatched
      && creatorMatched
      && updaterMatched
  })

  const totalRows = filtered.length
  const start = (Number(pageNum) - 1) * Number(pageSize)
  const end = start + Number(pageSize)
  filtered = filtered.slice(start, end)

  return {
    root: filtered,
    totalRows,
  }
}
