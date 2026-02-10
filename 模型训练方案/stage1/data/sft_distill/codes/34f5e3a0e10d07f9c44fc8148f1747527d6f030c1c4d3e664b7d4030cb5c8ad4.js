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

let diamond;
const MOVE_SPEED = 2;

function preload() {
  // 使用 Graphics 程序化生成菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制菱形
  graphics.fillStyle(0xff6b6b, 1);
  graphics.beginPath();
  graphics.moveTo(32, 0);    // 顶点
  graphics.lineTo(64, 32);   // 右点
  graphics.lineTo(32, 64);   // 底点
  graphics.lineTo(0, 32);    // 左点
  graphics.closePath();
  graphics.fillPath();
  
  // 添加描边
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建菱形精灵，初始位置在场景中心
  diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置相机跟随菱形对象
  // startFollow(target, roundPixels, lerpX, lerpY, offsetX, offsetY)
  // roundPixels: false - 不进行像素取整
  // lerpX/lerpY: 0.1 - 平滑跟随系数，值越小越平滑
  this.cameras.main.startFollow(diamond, false, 0.1, 0.1);
  
  // 设置相机边界，让相机可以无限跟随
  // 这里设置一个较大的世界边界
  this.cameras.main.setBounds(-2000, -2000, 4000, 4000);
  
  // 添加提示文字（固定在相机视图中）
  const text = this.add.text(10, 10, '相机跟随菱形移动', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机视图中，不随相机移动
  
  // 添加位置信息文字
  this.positionText = this.add.text(10, 50, '', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.positionText.setScrollFactor(0);
}

function update(time, delta) {
  // 让菱形向右上方移动
  // 向右移动（x 增加）
  diamond.x += MOVE_SPEED;
  // 向上移动（y 减少）
  diamond.y -= MOVE_SPEED;
  
  // 更新位置信息显示
  this.positionText.setText(
    `菱形位置: (${Math.round(diamond.x)}, ${Math.round(diamond.y)})\n` +
    `相机位置: (${Math.round(this.cameras.main.scrollX)}, ${Math.round(this.cameras.main.scrollY)})`
  );
  
  // 可选：添加旋转效果让菱形更生动
  diamond.rotation += 0.02;
}

new Phaser.Game(config);