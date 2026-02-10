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
  // 不需要预加载资源
}

function create() {
  // 在屏幕左下角创建文字
  // x: 20 表示距离左边 20 像素
  // y: 600 - 20 表示距离底部 20 像素
  const text = this.add.text(20, 580, 'Hello Phaser', {
    fontSize: '64px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置锚点为左下角 (0, 1)
  // 0 表示水平方向左对齐，1 表示垂直方向底部对齐
  text.setOrigin(0, 1);
}

new Phaser.Game(config);