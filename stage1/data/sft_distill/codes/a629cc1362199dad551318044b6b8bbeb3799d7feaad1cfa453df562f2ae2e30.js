// 完整的 Phaser3 代码 - 右上角显示文字
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
  // 在右上角创建文本对象
  // 位置：(画布宽度 - 20, 20) 距离右边和顶部各 20 像素
  const text = this.add.text(
    this.scale.width - 20,  // x 坐标：画布宽度减去边距
    20,                      // y 坐标：距离顶部 20 像素
    'Hello Phaser',          // 文本内容
    {
      fontSize: '48px',      // 字体大小
      color: '#ffffff',      // 白色文字
      fontFamily: 'Arial'    // 字体
    }
  );
  
  // 设置文本原点为右上角 (1, 0)
  // 这样文本会从右上角开始绘制，确保右对齐
  text.setOrigin(1, 0);
}

// 创建游戏实例
new Phaser.Game(config);