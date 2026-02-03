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
  // 本任务不需要预加载外部资源
}

function create() {
  // 在屏幕左下角创建文本
  // x=0 表示左侧，y=600 表示底部
  const text = this.add.text(0, 600, 'Hello Phaser', {
    fontSize: '80px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本原点为左下角 (0, 1)
  // 这样文本的左下角会对齐到 (0, 600) 位置
  text.setOrigin(0, 1);
}

new Phaser.Game(config);