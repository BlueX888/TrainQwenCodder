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
  // 本示例不需要预加载外部资源
}

function create() {
  // 在屏幕左侧创建文本对象
  // 参数：x坐标, y坐标, 文本内容, 样式配置
  this.add.text(50, 300, 'Hello Phaser', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
}

// 创建游戏实例
new Phaser.Game(config);