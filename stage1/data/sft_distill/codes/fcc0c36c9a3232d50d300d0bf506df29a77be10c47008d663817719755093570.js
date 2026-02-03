// Phaser3 游戏配置
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
  // 创建文本对象
  const text = this.add.text(
    780,  // x 坐标（屏幕宽度 800 - 边距 20）
    20,   // y 坐标（顶部边距 20）
    'Hello Phaser',  // 文本内容
    {
      fontSize: '48px',      // 字体大小
      fontFamily: 'Arial',   // 字体系列
      color: '#ffffff',      // 文字颜色（白色）
      fontStyle: 'bold'      // 字体样式（粗体）
    }
  );
  
  // 设置文本原点为右上角 (1, 0)
  // 这样文本会从右上角开始向左下延伸
  text.setOrigin(1, 0);
}

// 创建并启动 Phaser 游戏实例
new Phaser.Game(config);