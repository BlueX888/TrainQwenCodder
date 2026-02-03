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
  // 不需要预加载外部资源
}

function create() {
  // 创建文字对象，位置在屏幕右侧
  const text = this.add.text(650, 300, 'Hello Phaser', {
    fontSize: '16px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文字的原点为中心，使其垂直居中
  text.setOrigin(0, 0.5);
}

new Phaser.Game(config);