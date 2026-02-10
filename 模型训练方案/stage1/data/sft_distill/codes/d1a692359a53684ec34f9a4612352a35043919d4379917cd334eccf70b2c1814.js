const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let triangle;
let pointer;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1);
  
  // 绘制一个指向右侧的三角形（便于旋转跟随）
  graphics.beginPath();
  graphics.moveTo(30, 0);      // 顶点（右）
  graphics.lineTo(-15, -20);   // 左上
  graphics.lineTo(-15, 20);    // 左下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 50, 50);
  graphics.destroy();
  
  // 创建带物理体的三角形精灵
  triangle = this.physics.add.sprite(400, 300, 'triangleTex');
  triangle.setOrigin(0.5, 0.5);
  
  // 设置物理体属性
  triangle.setDamping(true);
  triangle.setDrag(0.99); // 添加轻微阻力使移动更平滑
  
  // 获取鼠标指针
  pointer = this.input.activePointer;
  
  // 添加提示文本
  this.add.text(10, 10, '移动鼠标，三角形会跟随', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算三角形到鼠标指针的角度
  const angle = Phaser.Math.Angle.Between(
    triangle.x,
    triangle.y,
    pointer.x,
    pointer.y
  );
  
  // 计算三角形到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    triangle.x,
    triangle.y,
    pointer.x,
    pointer.y
  );
  
  // 只有当距离大于一定阈值时才移动（避免抖动）
  if (distance > 5) {
    // 根据角度计算速度分量
    const velocityX = Math.cos(angle) * 200;
    const velocityY = Math.sin(angle) * 200;
    
    // 设置物理体速度
    triangle.setVelocity(velocityX, velocityY);
    
    // 旋转三角形使其朝向鼠标
    triangle.rotation = angle;
  } else {
    // 距离很近时停止移动
    triangle.setVelocity(0, 0);
  }
}

new Phaser.Game(config);