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
  // 在屏幕右侧显示文字 "Hello Phaser"
  // 位置设置为屏幕宽度减去一定边距
  const text = this.add.text(
    750,  // x 坐标：靠近右边缘（800 - 50 的边距）
    300,  // y 坐标：屏幕中央
    'Hello Phaser',  // 文本内容
    {
      fontSize: '16px',  // 字体大小 16 像素
      color: '#ffffff',  // 白色文字
      fontFamily: 'Arial'  // 字体
    }
  );
  
  // 设置文本的原点为右中，使其从右侧对齐
  text.setOrigin(1, 0.5);
}

new Phaser.Game(config);