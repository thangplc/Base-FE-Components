import type { CascaderOption } from '@/components/common/cascader'

/** Mock provinces → districts → wards shared by the Cascader stories. */
export const locations: CascaderOption[] = [
  {
    value: 'hn',
    label: 'Hà Nội',
    children: [
      {
        value: 'ba-dinh',
        label: 'Ba Đình',
        children: [
          { value: 'kim-ma', label: 'Kim Mã' },
          { value: 'ngoc-ha', label: 'Ngọc Hà' },
          { value: 'truc-bach', label: 'Trúc Bạch' },
        ],
      },
      {
        value: 'hoan-kiem',
        label: 'Hoàn Kiếm',
        children: [
          { value: 'hang-bac', label: 'Hàng Bạc' },
          { value: 'trang-tien', label: 'Tràng Tiền' },
        ],
      },
      { value: 'cau-giay', label: 'Cầu Giấy', children: [{ value: 'dich-vong', label: 'Dịch Vọng' }] },
    ],
  },
  {
    value: 'hcm',
    label: 'TP. Hồ Chí Minh',
    children: [
      {
        value: 'q1',
        label: 'Quận 1',
        children: [
          { value: 'ben-nghe', label: 'Bến Nghé' },
          { value: 'ben-thanh', label: 'Bến Thành' },
        ],
      },
      { value: 'q3', label: 'Quận 3', children: [{ value: 'vo-thi-sau', label: 'Võ Thị Sáu' }] },
      { value: 'thu-duc', label: 'Thủ Đức', disabled: true, children: [{ value: 'an-khanh', label: 'An Khánh' }] },
    ],
  },
  { value: 'dn', label: 'Đà Nẵng', children: [{ value: 'hai-chau', label: 'Hải Châu', children: [{ value: 'thach-thang', label: 'Thạch Thang' }] }] },
]
