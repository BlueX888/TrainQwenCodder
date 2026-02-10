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
const moveSpeed = 2; // 移动速度（像素/帧）

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建一个更大的世界边界，让菱形有足够的移动空间
  this.cameras.main.setBounds(-2000, -2000, 4000, 4000);
  
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff6b6b, 1); // 红色菱形
  graphics.lineStyle(3, 0xffffff, 1); // 白色边框
  
  // 绘制菱形（中心点为 32, 32）
  const size = 32;
  graphics.beginPath();
  graphics.moveTo(size, 0);      // 上顶点
  graphics.lineTo(size * 2, size); // 右顶点
  graphics.lineTo(size, size * 2); // 下顶点
  graphics.lineTo(0, size);        // 左顶点
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('diamondTexture', size * 2, size * 2);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建菱形精灵，初始位置在场景中心
  diamond = this.add.sprite(400, 300, 'diamondTexture');
  
  // 设置相机跟随菱形
  this.cameras.main.startFollow(diamond, true, 0.1, 0.1);
  
  // 可选：设置相机跟随的偏移量（保持菱形在屏幕中心）
  this.cameras.main.setFollowOffset(0, 0);
  
  // 添加提示文字（固定在相机视图上）
  const text = this.add.text(10, 10, '菱形自动向左上移动\n相机跟随中...', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随世界移动
  
  // 添加位置信息文字
  this.positionText = this.add.text(10, 80, '', {
    fontSize: '14px',
    color: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.positionText.setScrollFactor(0);
}

function update(time, delta) {
  // 让菱形向左上方移动
  // 左上方：x 减小，y 减小
  diamond.x -= moveSpeed;
  diamond.y -= moveSpeed;
  
  // 更新位置信息显示
  this.positionText.setText(
    `菱形位置: (${Math.round(diamond.x)}, ${Math.round(diamond.y)})\n` +
    `相机位置: (${Math.round(this.cameras.main.scrollX)}, ${Math.round(this.cameras.main.scrollY)})`
  );
}

// 创建游戏实例
new Phaser.Game(config);