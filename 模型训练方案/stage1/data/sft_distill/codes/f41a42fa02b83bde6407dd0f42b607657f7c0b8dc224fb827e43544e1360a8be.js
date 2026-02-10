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
  // 创建文本对象
  const text = this.add.text(
    780, // x 坐标：距离右边缘 20 像素
    580, // y 坐标：距离底部边缘 20 像素
    'Hello Phaser',
    {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }
  );
  
  // 设置文本锚点为右下角 (1, 1)
  // 这样文本会以右下角为基准点定位
  text.setOrigin(1, 1);
}

new Phaser.Game(config);