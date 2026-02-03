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
  // 本任务不需要预加载资源
}

function create() {
  // 在屏幕左侧创建文本
  // x: 50 表示距离左边 50 像素
  // y: 300 表示垂直居中
  const text = this.add.text(50, 300, 'Hello Phaser', {
    fontSize: '48px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本的垂直对齐，使其在 y 坐标上居中
  text.setOrigin(0, 0.5);
}

new Phaser.Game(config);