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
  // 本示例无需预加载资源
}

function create() {
  // 在屏幕右侧创建文本对象
  // x: 750 (距离右边界 50 像素)
  // y: 50 (距离顶部 50 像素)
  const text = this.add.text(750, 50, 'Hello Phaser', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff'
  });
  
  // 设置文本原点为右上角 (1, 0)
  // 这样文本会从右向左排列，适合右侧显示
  text.setOrigin(1, 0);
}

// 启动游戏
new Phaser.Game(config);