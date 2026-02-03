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
  // 本示例不需要预加载资源
}

function create() {
  // 在屏幕中心创建文本对象
  // 参数：x坐标, y坐标, 文本内容, 样式配置
  const text = this.add.text(400, 300, 'Hello Phaser', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本的原点为中心，使其居中显示
  text.setOrigin(0.5, 0.5);
}

// 启动游戏
new Phaser.Game(config);