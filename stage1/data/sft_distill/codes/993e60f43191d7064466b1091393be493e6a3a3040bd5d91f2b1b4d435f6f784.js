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
    400,  // x 坐标（屏幕中央）
    520,  // y 坐标（屏幕下方）
    'Hello Phaser',  // 文本内容
    {
      fontSize: '80px',  // 字体大小
      fontFamily: 'Arial',  // 字体族
      color: '#ffffff',  // 文本颜色
      align: 'center'  // 文本对齐
    }
  );
  
  // 设置文本的原点为中心点，使其居中显示
  text.setOrigin(0.5, 0.5);
}

new Phaser.Game(config);