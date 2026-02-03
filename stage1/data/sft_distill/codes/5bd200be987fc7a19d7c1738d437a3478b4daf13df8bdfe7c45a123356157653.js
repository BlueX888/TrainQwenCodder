class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.triangle = null;
    this.speed = 100; // 移动速度（像素/秒）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 绘制三角形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色三角形
    
    // 绘制等边三角形（中心点在原点）
    graphics.beginPath();
    graphics.moveTo(0, -20);      // 顶点
    graphics.lineTo(-17.32, 10);  // 左下角
    graphics.lineTo(17.32, 10);   // 右下角
    graphics.closePath();
    graphics.fillPath();
    
    // 生成纹理
    graphics.generateTexture('triangleTex', 40, 40);
    graphics.destroy(); // 销毁 graphics 对象，纹理已保存
    
    // 创建三角形 Sprite（起始位置在场景左侧）
    this.triangle = this.add.sprite(100, 300, 'triangleTex');
    
    // 设置相机跟随三角形
    // startFollow(target, roundPixels, lerpX, lerpY, offsetX, offsetY)
    // roundPixels: 是否四舍五入像素，避免抖动
    // lerpX/lerpY: 相机跟随的平滑度（0-1，1为立即跟随）
    this.cameras.main.startFollow(this.triangle, true, 0.1, 0.1);
    
    // 扩展世界边界，让三角形可以移动更远
    this.cameras.main.setBounds(0, 0, 3000, 600);
    
    // 添加提示文本（固定在相机视图）
    const text = this.add.text(10, 10, '三角形自动向右移动\n相机跟随并保持居中', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setScrollFactor(0); // 固定在相机视图，不随相机移动
    
    // 添加场景参考点（帮助观察移动）
    for (let i = 0; i < 3000; i += 200) {
      const marker = this.add.graphics();
      marker.fillStyle(0x666666, 0.5);
      marker.fillCircle(i, 300, 5);
      
      const label = this.add.text(i, 320, `${i}px`, {
        fontSize: '12px',
        fill: '#999999'
      });
      label.setOrigin(0.5, 0);
    }
  }

  update(time, delta) {
    // 让三角形持续向右移动
    // delta 是毫秒，转换为秒
    this.triangle.x += this.speed * (delta / 1000);
    
    // 可选：当三角形移动到边界时重置位置
    if (this.triangle.x > 2900) {
      this.triangle.x = 100;
    }
  }
}

// Phaser Game 配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  // 可选：如果需要在 Node.js 环境运行，使用 Phaser.HEADLESS
  // type: Phaser.HEADLESS,
};

// 创建游戏实例
new Phaser.Game(config);