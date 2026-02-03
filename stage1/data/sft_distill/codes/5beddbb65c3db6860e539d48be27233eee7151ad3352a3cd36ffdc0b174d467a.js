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
  // 创建文字对象，内容为 "Hello Phaser"，字体大小 80 像素
  const text = this.add.text(
    400,  // x 坐标：屏幕中央
    520,  // y 坐标：屏幕下方
    'Hello Phaser',
    {
      fontSize: '80px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }
  );

  // 设置文字的原点为中心点，使其居中对齐
  text.setOrigin(0.5, 0.5);
}

new Phaser.Game(config);