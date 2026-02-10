class ObstacleScene extends Phaser.Scene {
  constructor() {
    super('ObstacleScene');
    this.currentSeed = 12345; // 固定 seed，可修改测试
    this.obstacles = [];
    this.obstacleCount = 8;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 设置随机种子，确保确定性生成
    Phaser.Math.RND.sow([this.currentSeed]);

    // 创建青色障碍物纹理
    this.createObstacleTexture();

    // 生成 8 个障碍物
    this.generateObstacles();

    // 显示 seed 信息
    this.displaySeedInfo();

    // 显示验证信息
    this.displayVerificationInfo();

    // 添加重新生成按钮（按空格键）
    this.input.keyboard.on('keydown-SPACE', () => {
      this.currentSeed = Phaser.Math.Between(1, 99999);
      this.scene.restart();
    });

    // 添加提示文本
    const hintText = this.add.text(400, 580, 'Press SPACE to generate new layout', {
      fontSize: '16px',
      color: '#888888',
      align: 'center'
    });
    hintText.setOrigin(0.5);
  }

  createObstacleTexture() {
    const graphics = this.add.graphics();
    
    // 绘制青色矩形障碍物
    graphics.fillStyle(0x00CED1, 1); // 青色
    graphics.fillRect(0, 0, 64, 64);
    
    // 添加边框效果
    graphics.lineStyle(3, 0x00FFFF, 1);
    graphics.strokeRect(0, 0, 64, 64);
    
    // 生成纹理
    graphics.generateTexture('obstacleTexture', 64, 64);
    graphics.destroy();
  }

  generateObstacles() {
    // 清空之前的障碍物
    this.obstacles = [];

    // 定义安全边距
    const margin = 80;
    const minX = margin;
    const maxX = 800 - margin - 64;
    const minY = margin;
    const maxY = 600 - margin - 64;

    // 生成 8 个障碍物
    for (let i = 0; i < this.obstacleCount; i++) {
      // 使用确定性随机数生成位置
      const x = Phaser.Math.RND.between(minX, maxX);
      const y = Phaser.Math.RND.between(minY, maxY);
      
      // 随机生成尺寸（0.8 到 1.5 倍）
      const scale = Phaser.Math.RND.realInRange(0.8, 1.5);
      
      // 随机生成旋转角度
      const rotation = Phaser.Math.RND.angle();

      // 创建障碍物
      const obstacle = this.add.image(x, y, 'obstacleTexture');
      obstacle.setScale(scale);
      obstacle.setRotation(rotation);
      obstacle.setAlpha(0.9);

      // 添加发光效果
      obstacle.setTint(0x00CED1);

      // 记录障碍物信息用于验证
      this.obstacles.push({
        id: i,
        x: Math.round(x),
        y: Math.round(y),
        scale: Math.round(scale * 100) / 100,
        rotation: Math.round(rotation * 100) / 100
      });
    }
  }

  displaySeedInfo() {
    // 显示当前 seed
    const seedText = this.add.text(400, 30, `Seed: ${this.currentSeed}`, {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#00FFFF',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 4
    });
    seedText.setOrigin(0.5);

    // 添加标题
    const titleText = this.add.text(400, 70, 'Deterministic Obstacle Generation', {
      fontSize: '20px',
      color: '#FFFFFF',
      align: 'center'
    });
    titleText.setOrigin(0.5);
  }

  displayVerificationInfo() {
    // 显示障碍物数量
    const countText = this.add.text(20, 20, `Obstacles: ${this.obstacleCount}`, {
      fontSize: '18px',
      color: '#00FF00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示第一个障碍物的详细信息作为验证
    if (this.obstacles.length > 0) {
      const firstObstacle = this.obstacles[0];
      const verifyText = this.add.text(20, 50, 
        `First Obstacle:\n` +
        `  X: ${firstObstacle.x}\n` +
        `  Y: ${firstObstacle.y}\n` +
        `  Scale: ${firstObstacle.scale}\n` +
        `  Rotation: ${firstObstacle.rotation}`, {
        fontSize: '14px',
        color: '#FFFF00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
        lineSpacing: 2
      });
    }

    // 显示所有障碍物的哈希值（用于快速验证）
    const hash = this.calculateLayoutHash();
    const hashText = this.add.text(20, 550, `Layout Hash: ${hash}`, {
      fontSize: '14px',
      color: '#FF00FF',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    console.log('=== Obstacle Layout ===');
    console.log('Seed:', this.currentSeed);
    console.log('Obstacles:', this.obstacles);
    console.log('Hash:', hash);
  }

  calculateLayoutHash() {
    // 简单的哈希函数，用于验证布局一致性
    let hash = 0;
    this.obstacles.forEach(obs => {
      hash += obs.x * 1000 + obs.y * 100 + obs.scale * 10 + obs.rotation;
    });
    return Math.abs(Math.round(hash)) % 1000000;
  }

  update(time, delta) {
    // 添加微妙的脉动效果
    this.obstacles.forEach((obsData, index) => {
      const obstacle = this.children.list.find(child => 
        child.x === obsData.x && child.y === obsData.y
      );
      if (obstacle && obstacle.type === 'Image') {
        const pulse = Math.sin(time * 0.001 + index) * 0.05 + 1;
        obstacle.setScale(obsData.scale * pulse);
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: ObstacleScene,
  parent: 'game-container'
};

new Phaser.Game(config);