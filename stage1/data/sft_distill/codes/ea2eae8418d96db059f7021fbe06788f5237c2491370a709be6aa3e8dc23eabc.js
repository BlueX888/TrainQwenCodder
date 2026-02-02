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
const MAX_TRIANGLES = 5;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 重置计数器
  triangleCount = 0;
  
  // 添加标题文本
  this.add.text(10, 10, '粉色三角形生成器', {
    fontSize: '24px',
    color: '#ffffff'
  });
  
  // 添加计数文本
  const countText = this.add.text(10, 50, `已生成: ${triangleCount}/${MAX_TRIANGLES}`, {
    fontSize: '18px',
    color: '#ffffff'
  });
  
  // 创建定时器，每3秒触发一次
  this.time.addEvent({
    delay: 3000, // 3秒
    callback: () => {
      // 检查是否已达到最大数量
      if (triangleCount < MAX_TRIANGLES) {
        // 生成随机位置
        const x = Phaser.Math.Between(100, 700);
        const y = Phaser.Math.Between(150, 550);
        
        // 创建粉色三角形
        createPinkTriangle(this, x, y);
        
        // 增加计数
        triangleCount++;
        
        // 更新计数文本
        countText.setText(`已生成: ${triangleCount}/${MAX_TRIANGLES}`);
        
        // 如果达到最大数量，显示完成提示
        if (triangleCount >= MAX_TRIANGLES) {
          this.add.text(400, 100, '已生成全部三角形！', {
            fontSize: '20px',
            color: '#ffff00'
          }).setOrigin(0.5);
        }
      }
    },
    callbackScope: this,
    loop: true // 循环执行
  });
  
  // 添加提示文本
  this.add.text(400, 580, '每3秒生成一个粉色三角形', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

/**
 * 创建粉色三角形
 * @param {Phaser.Scene} scene - 场景对象
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 */
function createPinkTriangle(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1); // 粉色 (HotPink)
  
  // 绘制三角形（等边三角形）
  const size = 40; // 三角形大小
  graphics.beginPath();
  graphics.moveTo(x, y - size); // 顶点
  graphics.lineTo(x - size, y + size); // 左下角
  graphics.lineTo(x + size, y + size); // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 添加白色边框
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
  
  // 添加轻微的缩放动画
  graphics.setScale(0.5);
  scene.tweens.add({
    targets: graphics,
    scale: 1,
    duration: 500,
    ease: 'Back.easeOut'
  });
}

new Phaser.Game(config);