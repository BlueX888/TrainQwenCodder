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
  // 创建文本对象，位置在右下角（留出 20 像素边距）
  const text = this.add.text(
    780,  // x 坐标：800 - 20
    580,  // y 坐标：600 - 20
    'Hello Phaser',  // 文本内容
    {
      fontSize: '32px',  // 字体大小
      color: '#ffffff',  // 文字颜色（白色）
      fontFamily: 'Arial'  // 字体
    }
  );
  
  // 设置文本锚点为右下角 (1, 1)
  // 这样文本会以右下角为基准点定位
  text.setOrigin(1, 1);
}

// 启动游戏
new Phaser.Game(config);