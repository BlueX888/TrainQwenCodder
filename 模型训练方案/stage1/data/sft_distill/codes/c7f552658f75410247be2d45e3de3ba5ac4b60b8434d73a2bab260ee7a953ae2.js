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

// 记录已生成的三角形数量
let triangleCount = 0;
const MAX_TRIANGLES = 15;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建定时器事件，每4秒触发一次
  const timerEvent = this.time.addEvent({
    delay: 4000, // 4秒
    callback: spawnTriangle,
    callbackScope: this,
    loop: true
  });

  // 存储定时器引用，方便后续停止
  this.triangleTimer = timerEvent;

  // 添加文本显示当前三角形数量
  this.countText = this.add.text(10, 10, `三角形数量: 0/${MAX_TRIANGLES}`, {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function spawnTriangle() {
  // 检查是否已达到最大数量
  if (triangleCount >= MAX_TRIANGLES) {
    this.triangleTimer.remove(); // 停止定时器
    this.countText.setText(`三角形数量: ${triangleCount}/${MAX_TRIANGLES} (已完成)`);
    return;
  }

  // 生成随机位置
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);

  // 使用Graphics绘制蓝色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色

  // 绘制三角形（等边三角形）
  const size = 30;
  graphics.fillTriangle(
    0, -size,           // 顶点
    -size, size,        // 左下角
    size, size          // 右下角
  );

  // 设置位置
  graphics.setPosition(x, y);

  // 增加计数
  triangleCount++;

  // 更新文本显示
  this.countText.setText(`三角形数量: ${triangleCount}/${MAX_TRIANGLES}`);

  // 添加简单的出现动画
  graphics.setScale(0);
  this.tweens.add({
    targets: graphics,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
}

// 创建游戏实例
new Phaser.Game(config);