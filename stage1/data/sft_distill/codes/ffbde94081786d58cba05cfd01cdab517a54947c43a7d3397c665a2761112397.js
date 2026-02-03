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
  // 本示例不需要预加载任何资源
}

function create() {
  // 创建文字对象
  const text = this.add.text(
    400,  // x 坐标：屏幕水平中心
    550,  // y 坐标：屏幕下方位置
    'Hello Phaser',  // 文字内容
    {
      fontSize: '80px',  // 字体大小
      fontFamily: 'Arial',  // 字体系列
      color: '#ffffff',  // 文字颜色（白色）
      align: 'center'  // 文字对齐方式
    }
  );
  
  // 设置文字的原点为中心，使其居中显示
  text.setOrigin(0.5, 0.5);
}

// 创建并启动 Phaser 游戏实例
new Phaser.Game(config);