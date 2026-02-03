class DeterministicObstaclesScene extends Phaser.Scene {
  constructor() {
    super('DeterministicObstaclesScene');
    this.currentSeed = ['phaser', 'deterministic', '2024'];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置固定的随机种子以确保确定性生成
    this.game.config.seed = this.currentSeed;
    Phaser.Math.RND.sow(this.currentSeed);

    // 存储障碍物信息用于验证
    this.obstacles = [];
    
    // 生成 12 个青色障碍物
    const obstacleCount = 12;
    const minSize = 40;
    const maxSize = 80;
    const margin = 50;
    
    for (let i = 0; i < obstacleCount; i++) {
      // 使用固定种子的随机数生成器生成位置和尺寸
      const x = Phaser.Math.RND.between(margin, this.game.config.width - margin);
      const y = Phaser.Math.RND.between(margin, this.game.config.height - margin);
      const width = Phaser.Math.RND.between(minSize, maxSize);
      const height = Phaser.Math.RND.between(minSize, maxSize);
      
      // 使用 Graphics 绘制青色矩形障碍物
      const graphics = this.add.graphics();
      graphics.fillStyle(0x00FFFF, 1); // 青色 (Cyan)
      graphics.fillRect(x - width / 2, y - height / 2, width, height);
      
      // 添加边框使障碍物更明显
      graphics.lineStyle(2, 0x00CCCC, 1);
      graphics.strokeRect(x - width / 2, y - height / 2, width, height);
      
      // 记录障碍物信息
      this.obstacles.push({
        id: i,
        x: x,
        y: y,
        width: width,
        height: height
      });
    }
    
    // 显示当前 seed 信息
    const seedText = `Seed: [${this.currentSeed.join(', ')}]`;
    this.add.text(10, 10, seedText, {
      fontSize: '20px',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 显示障碍物数量
    this.add.text(10, 50, `Obstacles: ${obstacleCount}`, {
      fontSize: '18px',
      color: '#00FFFF',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 显示提示信息
    this.add.text(10, this.game.config.height - 40, 'Same seed = Same layout', {
      fontSize: '16px',
      color: '#FFFF00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 输出可验证的信号
    window.__signals__ = {
      seed: this.currentSeed,
      obstacleCount: obstacleCount,
      obstacles: this.obstacles,
      timestamp: Date.now(),
      deterministic: true
    };
    
    // 输出到控制台以便验证
    console.log('=== Deterministic Obstacles Generated ===');
    console.log('Seed:', JSON.stringify(this.currentSeed));
    console.log('Obstacles:', JSON.stringify(this.obstacles, null, 2));
    console.log('Hash:', this.generateHash(this.obstacles));
  }
  
  // 生成障碍物布局的哈希值用于快速验证确定性
  generateHash(obstacles) {
    let hash = 0;
    obstacles.forEach(obs => {
      hash = ((hash << 5) - hash) + obs.x + obs.y + obs.width + obs.height;
      hash = hash & hash; // Convert to 32bit integer
    });
    return hash.toString(16);
  }

  update(time, delta) {
    // 不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DeterministicObstaclesScene,
  seed: ['phaser', 'deterministic', '2024'] // 设置全局种子
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 验证函数：可以通过改变 seed 来验证确定性
function verifySeed(newSeed) {
  game.destroy(true);
  config.seed = newSeed;
  const newGame = new Phaser.Game(config);
  console.log('Game restarted with new seed:', newSeed);
}

// 暴露验证函数到全局
window.verifySeed = verifySeed;
console.log('Use verifySeed(["new", "seed"]) to test with different seed');