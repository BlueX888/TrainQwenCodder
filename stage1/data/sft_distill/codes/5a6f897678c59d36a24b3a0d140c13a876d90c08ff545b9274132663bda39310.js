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

let triangle;
let targetX = 400;
let targetY = 300;
const followSpeed = 160; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制黄色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  
  // 绘制一个等边三角形（指向上方）
  graphics.beginPath();
  graphics.moveTo(0, -20);      // 顶点
  graphics.lineTo(-17.32, 10);  // 左下角
  graphics.lineTo(17.32, 10);   // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangleTexture', 40, 40);
  graphics.destroy();
  
  // 创建三角形精灵
  triangle = this.add.sprite(400, 300, 'triangleTexture');
  
  // 初始化目标位置为三角形当前位置
  targetX = triangle.x;
  targetY = triangle.y;
  
  // 监听鼠标移动事件
  this.input.on('pointermove', (pointer) => {
    targetX = pointer.x;
    targetY = pointer.y;
  });
  
  // 设置初始目标位置为当前鼠标位置
  this.input.on('pointerdown', (pointer) => {
    targetX = pointer.x;
    targetY = pointer.y;
  });
}

function update(time, delta) {
  // 计算三角形到目标位置的距离
  const distance = Phaser.Math.Distance.Between(
    triangle.x,
    triangle.y,
    targetX,
    targetY
  );
  
  // 如果距离大于1像素，则移动三角形
  if (distance > 1) {
    // 计算角度
    const angle = Phaser.Math.Angle.Between(
      triangle.x,
      triangle.y,
      targetX,
      targetY
    );
    
    // 计算本帧应该移动的距离（速度 * 时间差）
    const moveDistance = followSpeed * (delta / 1000);
    
    // 如果移动距离小于剩余距离，则按速度移动；否则直接到达目标
    if (moveDistance < distance) {
      triangle.x += Math.cos(angle) * moveDistance;
      triangle.y += Math.sin(angle) * moveDistance;
    } else {
      triangle.x = targetX;
      triangle.y = targetY;
    }
    
    // 旋转三角形使其指向移动方向
    triangle.rotation = angle + Math.PI / 2; // +90度使三角形顶点指向前方
  }
}

new Phaser.Game(config);