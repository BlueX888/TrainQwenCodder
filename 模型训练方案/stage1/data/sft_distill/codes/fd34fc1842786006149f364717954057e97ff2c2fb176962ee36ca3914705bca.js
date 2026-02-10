// 完整的 Phaser3 代码
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
  // 在屏幕右侧创建文字
  // x 坐标设置为 750（距离右边缘 50 像素）
  // y 坐标设置为屏幕中央
  const text = this.add.text(750, 300, 'Hello Phaser', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文字锚点为右中，确保文字从右侧对齐
  text.setOrigin(1, 0.5);
}

// 启动游戏
new Phaser.Game(config);