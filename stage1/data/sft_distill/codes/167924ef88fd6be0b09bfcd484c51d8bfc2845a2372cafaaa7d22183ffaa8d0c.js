// Phaser3 游戏配置
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
  // 本示例不需要预加载外部资源
}

function create() {
  // 在屏幕右侧创建文本
  // x 坐标设置为 750（距离右边界 50 像素）
  // y 坐标设置为屏幕中央 300
  const text = this.add.text(750, 300, 'Hello Phaser', {
    fontSize: '48px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置锚点为右中心 (1, 0.5)
  // 这样文本会从右向左排列，确保显示在屏幕右侧
  text.setOrigin(1, 0.5);
}

// 启动 Phaser 游戏
new Phaser.Game(config);