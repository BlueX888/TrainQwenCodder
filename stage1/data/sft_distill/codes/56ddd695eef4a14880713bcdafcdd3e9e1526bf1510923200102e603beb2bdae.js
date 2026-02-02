// 完整的 Phaser3 代码
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 不需要预加载资源
}

function create() {
  // 在屏幕左下角创建文字
  // x: 0（左边）, y: 600（底部）
  const text = this.add.text(0, 600, 'Hello Phaser', {
    fontSize: '64px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置原点为左下角 (0, 1)
  // 这样文字就会从左下角开始绘制
  text.setOrigin(0, 1);
}

// 启动游戏
new Phaser.Game(config);