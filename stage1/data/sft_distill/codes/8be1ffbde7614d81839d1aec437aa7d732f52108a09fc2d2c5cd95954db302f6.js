const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let square;
const rotationSpeed = Phaser.Math.DegToRad(120); // 每秒 120 度转换为弧度

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制方块
  square = this.add.graphics();
  
  // 设置填充颜色为红色
  square.fillStyle(0xff0000, 1);
  
  // 绘制一个 100x100 的方块，中心点在原点
  // 使用 -50, -50 作为起点，使旋转中心在方块中心
  square.fillRect(-50, -50, 100, 100);
  
  // 将方块定位到画布中心
  square.setPosition(400, 300);
  
  // 添加提示文本
  const text = this.add.text(10, 10, '方块旋转速度: 120度/秒', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // delta 是以毫秒为单位的时间差
  // 将 delta 转换为秒并乘以旋转速度
  const rotationDelta = rotationSpeed * (delta / 1000);
  
  // 累加旋转角度
  square.rotation += rotationDelta;
}

// 创建游戏实例
new Phaser.Game(config);