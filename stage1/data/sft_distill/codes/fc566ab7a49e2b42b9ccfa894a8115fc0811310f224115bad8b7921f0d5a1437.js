const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 存储三角形的数组
let triangles = [];
let timerEvent;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 初始化三角形数组
  triangles = [];
  
  // 创建定时器事件，每4秒触发一次
  timerEvent = this.time.addEvent({
    delay: 4000,                // 4秒
    callback: spawnTriangle,    // 回调函数
    callbackScope: this,        // 回调作用域
    loop: true,                 // 循环执行
    startAt: 0                  // 立即开始第一次
  });
  
  // 添加文本提示
  this.add.text(10, 10, '每4秒生成一个白色三角形（最多3个）', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function spawnTriangle() {
  // 检查是否已达到最大数量
  if (triangles.length >= 3) {
    console.log('已达到最大三角形数量(3个)');
    return;
  }
  
  // 生成随机位置
  const x = Phaser.Math.Between(100, 700);
  const y = Phaser.Math.Between(100, 500);
  
  // 使用Graphics绘制三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1); // 白色
  
  // 绘制三角形（等边三角形）
  const size = 40;
  const height = size * Math.sqrt(3) / 2;
  
  graphics.beginPath();
  graphics.moveTo(x, y - height / 2);           // 顶点
  graphics.lineTo(x - size / 2, y + height / 2); // 左下
  graphics.lineTo(x + size / 2, y + height / 2); // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 添加到数组中
  triangles.push(graphics);
  
  console.log(`生成第${triangles.length}个三角形，位置: (${x}, ${y})`);
}

function update(time, delta) {
  // 本示例不需要update逻辑
}

new Phaser.Game(config);