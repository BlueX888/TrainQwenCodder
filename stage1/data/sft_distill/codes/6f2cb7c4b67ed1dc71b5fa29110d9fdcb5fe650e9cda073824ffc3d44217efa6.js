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
  // 无需预加载资源
}

function create() {
  // 在左下角创建文字对象
  const text = this.add.text(10, 590, 'Hello Phaser', {
    fontSize: '16px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置锚点为左下角，确保文字从左下角开始显示
  text.setOrigin(0, 1);
}

new Phaser.Game(config);