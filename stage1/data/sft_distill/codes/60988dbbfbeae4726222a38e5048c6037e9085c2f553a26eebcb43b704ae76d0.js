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

function preload() {
  // 无需预加载资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    createStar(this, pointer.x, pointer.y);
  });
}

/**
 * 在指定位置创建橙色星形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - 星形中心 x 坐标
 * @param {number} y - 星形中心 y 坐标
 */
function createStar(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xFF8C00, 1);
  
  // 星形参数
  const outerRadius = 32; // 外半径（总大小64像素）
  const innerRadius = 16; // 内半径
  const points = 5; // 五角星
  
  // 创建星形路径
  const path = new Phaser.Geom.Path();
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    
    if (i === 0) {
      path.moveTo(px, py);
    } else {
      path.lineTo(px, py);
    }
  }
  
  // 闭合路径
  path.closePath();
  
  // 填充星形
  graphics.fillPath(path);
}

new Phaser.Game(config);