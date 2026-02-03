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
  // 在左下角显示文字
  // x: 10px 距离左边
  // y: 600 - 20 = 580px 距离顶部（接近底部）
  const text = this.add.text(10, 580, 'Hello Phaser', {
    fontSize: '16px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本原点为左下角，使定位更精确
  text.setOrigin(0, 1);
}

new Phaser.Game(config);