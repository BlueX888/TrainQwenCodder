// 完整的 Phaser3 代码 - 在屏幕右侧显示文字
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 本示例不需要预加载资源
}

function create() {
  // 在屏幕右侧创建文字对象
  // x: 750 (距离右边缘 50 像素)
  // y: 300 (垂直居中)
  const text = this.add.text(750, 300, 'Hello Phaser', {
    fontSize: '64px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置锚点为右中心 (1, 0.5)
  // 这样文字会以右边缘为基准对齐
  text.setOrigin(1, 0.5);
}

new Phaser.Game(config);