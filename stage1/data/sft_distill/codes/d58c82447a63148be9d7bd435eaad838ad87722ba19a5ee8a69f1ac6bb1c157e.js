// 完整的 Phaser3 代码 - 在屏幕左下显示文字
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
  // x: 20 (左侧留一点边距)
  // y: this.scale.height - 20 (底部留一点边距)
  const text = this.add.text(20, this.scale.height - 20, 'Hello Phaser', {
    fontSize: '64px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本原点为左下角 (0, 1)
  // 这样文本会从左下角开始绘制，而不是默认的左上角
  text.setOrigin(0, 1);
}

// 启动游戏
new Phaser.Game(config);