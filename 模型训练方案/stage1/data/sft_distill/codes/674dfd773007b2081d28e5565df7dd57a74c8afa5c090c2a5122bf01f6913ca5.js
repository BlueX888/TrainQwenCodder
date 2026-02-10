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
  // 无需预加载资源
}

function create() {
  // 在屏幕下方创建文本，字体大小 16 像素
  const text = this.add.text(
    400,  // x 坐标（屏幕中心）
    550,  // y 坐标（屏幕下方）
    'Hello Phaser',  // 文本内容
    {
      fontSize: '16px',  // 字体大小
      color: '#ffffff',  // 白色文字
      fontFamily: 'Arial'  // 字体
    }
  );
  
  // 设置文本的原点为中心，使其水平居中对齐
  text.setOrigin(0.5, 0.5);
}

new Phaser.Game(config);