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
  // 在屏幕下方显示文字
  const text = this.add.text(
    400,  // x 坐标：屏幕水平居中
    550,  // y 坐标：屏幕下方
    'Hello Phaser',  // 文本内容
    {
      fontSize: '32px',  // 字体大小
      color: '#ffffff',  // 文字颜色（白色）
      fontFamily: 'Arial'  // 字体
    }
  );
  
  // 设置文本锚点为中心，使其真正居中
  text.setOrigin(0.5, 0.5);
}

new Phaser.Game(config);