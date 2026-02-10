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
  // 在屏幕右上角创建文字
  // 位置设置为 (800, 0)，即画布右上角
  // setOrigin(1, 0) 表示以文字的右上角为锚点，实现右对齐
  const text = this.add.text(800, 0, 'Hello Phaser', {
    fontSize: '16px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置锚点为右上角，使文字从右上角开始显示
  text.setOrigin(1, 0);
}

new Phaser.Game(config);