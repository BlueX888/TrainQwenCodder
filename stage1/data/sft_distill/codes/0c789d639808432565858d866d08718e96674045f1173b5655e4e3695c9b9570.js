// 固定 seed 用于确定性生成
const FIXED_SEED = ['PHASER', '12345'];

class DeterministicScene extends Phaser.Scene {
  constructor() {
    super('DeterministicScene');
    this.obstacleCount = 0;
    this.currentSeed = FIXED_SEED.join('-');
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置随机数生成器的种子
    this.rnd = new Phaser.Math.RandomDataGenerator(FIXED_SEED);
    
    // 显示当前 seed
    const seedText = this.add.text(400, 30, `Seed: ${this.currentSeed}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    seedText.setOrigin(0.5, 0.5);

    // 添加说明文字
    const infoText = this.add.text(400, 70, 'Deterministic Obstacle Generation', {
      fontSize: '18px',
      color: '#cccccc',
      fontFamily: 'Arial'
    });
    infoText.setOrigin(0.5, 0.5);

    // 创建 Graphics 对象用于绘制障碍物
    const graphics = this.add.graphics();
    
    // 生成 3 个青色障碍物
    const obstacles = [];
    const obstacleData = [];
    
    for (let i = 0; i < 3; i++) {
      // 使用确定性随机数生成位置和尺寸
      const x = this.rnd.between(100, 700);
      const y = this.rnd.between(150, 500);
      const width = this.rnd.between(80, 150);
      const height = this.rnd.between(60, 120);
      
      // 保存障碍物数据用于验证
      obstacleData.push({ x, y, width, height });
      
      // 绘制青色矩形障碍物
      graphics.fillStyle(0x00ffff, 1); // 青色 (cyan)
      graphics.fillRect(x, y, width, height);
      
      // 添加边框使障碍物更明显
      graphics.lineStyle(3, 0x00cccc, 1);
      graphics.strokeRect(x, y, width, height);
      
      // 添加障碍物标签
      const label = this.add.text(x + width / 2, y + height / 2, `#${i + 1}`, {
        fontSize: '20px',
        color: '#000000',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5, 0.5);
      
      obstacles.push({ x, y, width, height });
      this.obstacleCount++;
    }

    // 显示障碍物统计信息
    const statsText = this.add.text(400, 560, 
      `Obstacles Generated: ${this.obstacleCount}`, {
      fontSize: '18px',
      color: '#00ffff',
      fontFamily: 'Arial'
    });
    statsText.setOrigin(0.5, 0.5);

    // 在控制台输出障碍物数据用于验证确定性
    console.log('Seed:', this.currentSeed);
    console.log('Obstacles:', obstacleData);
    
    // 添加重新生成按钮提示
    const hintText = this.add.text(400, 110, 
      'Refresh page to verify deterministic generation', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'Arial',
      fontStyle: 'italic'
    });
    hintText.setOrigin(0.5, 0.5);

    // 保存障碍物数据到场景以供验证
    this.obstacles = obstacles;
    this.obstacleData = obstacleData;
  }

  update(time, delta) {
    // 不需要每帧更新逻辑
  }
}

// Game 配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: DeterministicScene,
  // 设置全局 seed 确保完全确定性
  seed: FIXED_SEED
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 验证接口：可以通过 game.scene.scenes[0] 访问场景数据
// 例如：game.scene.scenes[0].obstacleCount 应该始终为 3
// game.scene.scenes[0].obstacleData 应该在相同 seed 下保持一致