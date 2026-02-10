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

// 三角形计数器
let triangleCount = 0;
const MAX_TRIANGLES = 15;

function preload() {
  // 无需预加载资源
}

function create() {
  // 添加标题文本
  this.add.text(10, 10, 'Blue Triangles Generator', {
    fontSize: '24px',
    color: '#ffffff'
  });

  // 添加计数器文本
  const counterText = this.add.text(10, 50, `Triangles: 0 / ${MAX_TRIANGLES}`, {
    fontSize: '18px',
    color: '#ffffff'
  });

  // 创建定时器事件，每4秒生成一个三角形
  const timerEvent = this.time.addEvent({
    delay: 4000, // 4秒
    callback: () => {
      // 检查是否达到最大数量
      if (triangleCount >= MAX_TRIANGLES) {
        timerEvent.remove(); // 停止定时器
        counterText.setText(`Triangles: ${triangleCount} / ${MAX_TRIANGLES} (Complete!)`);
        counterText.setColor('#00ff00');
        return;
      }

      // 生成随机位置
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(100, 550);

      // 创建蓝色三角形
      createTriangle(this, x, y);

      // 更新计数器
      triangleCount++;
      counterText.setText(`Triangles: ${triangleCount} / ${MAX_TRIANGLES}`);
    },
    callbackScope: this,
    loop: true // 循环执行
  });

  // 添加提示文本
  this.add.text(10, 570, 'New triangle spawns every 4 seconds', {
    fontSize: '14px',
    color: '#888888'
  });
}

/**
 * 创建蓝色三角形
 * @param {Phaser.Scene} scene - 场景对象
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 */
function createTriangle(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 设置蓝色填充
  graphics.fillStyle(0x0066ff, 1);
  
  // 绘制等边三角形（顶点朝上）
  const size = 30; // 三角形大小
  graphics.beginPath();
  graphics.moveTo(x, y - size); // 顶点
  graphics.lineTo(x - size, y + size); // 左下角
  graphics.lineTo(x + size, y + size); // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 添加白色边框使三角形更明显
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePath();
  
  // 添加淡入动画效果
  graphics.setAlpha(0);
  scene.tweens.add({
    targets: graphics,
    alpha: 1,
    duration: 500,
    ease: 'Power2'
  });
}

new Phaser.Game(config);