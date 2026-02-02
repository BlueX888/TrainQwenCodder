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
let timerEvent;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建蓝色三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  
  // 绘制一个等边三角形（顶点朝上）
  graphics.fillTriangle(
    25, 5,   // 顶点
    5, 45,   // 左下
    45, 45   // 右下
  );
  
  // 生成纹理
  graphics.generateTexture('blueTriangle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建定时器事件，每4秒触发一次
  timerEvent = this.time.addEvent({
    delay: 4000, // 4秒
    callback: spawnTriangle,
    callbackScope: this,
    loop: true
  });
  
  // 立即生成第一个三角形
  spawnTriangle.call(this);
}

function spawnTriangle() {
  // 检查是否已达到最大数量
  if (triangleCount >= MAX_TRIANGLES) {
    timerEvent.remove(); // 停止定时器
    console.log('已生成最大数量的三角形：' + MAX_TRIANGLES);
    return;
  }
  
  // 生成随机位置（确保三角形完全在画布内）
  const x = Phaser.Math.Between(25, 775);
  const y = Phaser.Math.Between(25, 575);
  
  // 创建三角形精灵
  const triangle = this.add.image(x, y, 'blueTriangle');
  
  // 增加计数
  triangleCount++;
  
  console.log(`生成第 ${triangleCount} 个三角形，位置：(${x}, ${y})`);
}

new Phaser.Game(config);