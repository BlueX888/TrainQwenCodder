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

let triangleCount = 0;
const MAX_TRIANGLES = 15;

function preload() {
  // 无需预加载资源
}

function create() {
  // 重置计数器
  triangleCount = 0;
  
  // 添加文本显示当前三角形数量
  const countText = this.add.text(10, 10, 'Triangles: 0/15', {
    fontSize: '24px',
    color: '#ffffff'
  });
  
  // 创建定时器事件，每 4 秒执行一次
  this.time.addEvent({
    delay: 4000,                    // 4 秒间隔
    callback: () => {
      // 生成随机位置
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      // 创建 Graphics 对象绘制蓝色三角形
      const graphics = this.add.graphics();
      graphics.fillStyle(0x0000ff, 1); // 蓝色
      
      // 绘制三角形（等边三角形）
      const size = 30;
      graphics.beginPath();
      graphics.moveTo(x, y - size);           // 顶点
      graphics.lineTo(x - size, y + size);    // 左下角
      graphics.lineTo(x + size, y + size);    // 右下角
      graphics.closePath();
      graphics.fillPath();
      
      // 增加计数
      triangleCount++;
      countText.setText(`Triangles: ${triangleCount}/${MAX_TRIANGLES}`);
      
      console.log(`Generated triangle #${triangleCount} at (${x}, ${y})`);
    },
    callbackScope: this,
    repeat: MAX_TRIANGLES - 1       // 重复 14 次（加上首次共 15 次）
  });
  
  // 添加提示文本
  this.add.text(400, 300, 'Blue triangles will spawn every 4 seconds', {
    fontSize: '20px',
    color: '#888888'
  }).setOrigin(0.5);
}

new Phaser.Game(config);