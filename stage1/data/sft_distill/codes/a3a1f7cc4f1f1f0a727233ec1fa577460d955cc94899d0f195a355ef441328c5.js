// 完整的 Phaser3 代码
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
  // 不需要预加载外部资源
}

function create() {
  // 在屏幕右侧显示文字 "Hello Phaser"
  // x 坐标设置为 780（接近屏幕右边缘 800）
  // y 坐标设置为屏幕中央 300
  const text = this.add.text(780, 300, 'Hello Phaser', {
    fontSize: '16px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本原点为右中，使文字右对齐显示
  text.setOrigin(1, 0.5);
}

// 创建游戏实例
new Phaser.Game(config);