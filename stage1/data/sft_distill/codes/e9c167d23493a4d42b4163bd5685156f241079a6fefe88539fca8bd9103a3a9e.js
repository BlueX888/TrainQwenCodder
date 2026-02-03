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
  // 本任务无需预加载资源
}

function create() {
  // 在屏幕左下角创建文本
  // x: 20 (左边距), y: 580 (接近底部)
  const text = this.add.text(20, 580, 'Hello Phaser', {
    fontSize: '64px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本原点为左下角 (0, 1)
  // 这样文本会从左下角开始绘制，便于定位
  text.setOrigin(0, 1);
}

// 启动游戏
new Phaser.Game(config);