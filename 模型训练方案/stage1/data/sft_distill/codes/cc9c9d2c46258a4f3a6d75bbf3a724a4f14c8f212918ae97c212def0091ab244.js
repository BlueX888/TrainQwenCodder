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
  // 在屏幕下方显示文字
  const text = this.add.text(
    400,  // x 坐标：屏幕中央
    550,  // y 坐标：屏幕底部
    'Hello Phaser',  // 文本内容
    {
      fontSize: '32px',  // 字体大小
      color: '#ffffff',  // 文字颜色
      fontFamily: 'Arial'  // 字体
    }
  );
  
  // 设置文本的原点为中心，使其居中对齐
  text.setOrigin(0.5, 0.5);
}

new Phaser.Game(config);