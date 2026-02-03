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
  // 在屏幕中心创建文本对象
  const text = this.add.text(
    400,  // x 坐标
    300,  // y 坐标
    'Hello Phaser',  // 文本内容
    {
      fontSize: '64px',  // 字体大小
      color: '#ffffff',  // 文字颜色（白色）
      fontFamily: 'Arial'  // 字体族
    }
  );
  
  // 设置文本的原点为中心，使其居中显示
  text.setOrigin(0.5, 0.5);
}

// 创建游戏实例
new Phaser.Game(config);