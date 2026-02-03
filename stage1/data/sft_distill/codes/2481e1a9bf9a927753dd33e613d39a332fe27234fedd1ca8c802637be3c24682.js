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
  // 在屏幕左侧创建文本对象
  // x: 50 表示距离左边 50 像素
  // y: 300 表示垂直居中
  const text = this.add.text(50, 300, 'Hello Phaser', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本的垂直对齐原点，使其垂直居中
  text.setOrigin(0, 0.5);
}

new Phaser.Game(config);