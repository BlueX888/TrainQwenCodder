class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacles = [];
    this.currentSeed = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置固定 seed（可以通过配置传入）
    this.currentSeed = this.game.config.seed || [12345];
    
    // 初始化随机数生成器
    this.rnd = new Phaser.Math.RandomDataGenerator(this.currentSeed);
    
    // 生成 12 个障碍物
    const obstacleData = [];
    for (let i = 0; i < 12; i++) {
      const x = this.rnd.between(50, 750);
      const y = this.rnd.between(100, 550);
      const width = this.rnd.between(40, 100);
      const height = this.rnd.between(40, 100);
      
      obstacleData.push({ x, y, width, height });
      
      // 使用 Graphics 绘制青色障碍物
      const graphics = this.add.graphics();
      graphics.fillStyle(0x00FFFF, 1); // 青色
      graphics.fillRect(x - width / 2, y - height / 2, width, height);
      
      // 添加边框以便更清晰地看到障碍物
      graphics.lineStyle(2, 0x00AAAA, 1);
      graphics.strokeRect(x - width / 2, y - height / 2, width, height);
      
      this.obstacles.push({
        graphics,
        x,
        y,
        width,
        height
      });
    }
    
    // 显示当前 seed
    const seedText = this.add.text(10, 10, `Seed: ${JSON.stringify(this.currentSeed)}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    seedText.setDepth(1000);
    
    // 显示障碍物数量
    const countText = this.add.text(10, 45, `Obstacles: ${this.obstacles.length}`, {
      fontSize: '18px',
      color: '#00FFFF',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    countText.setDepth(1000);
    
    // 显示说明
    const infoText = this.add.text(10, 80, 'Same seed = Same layout', {
      fontSize: '16px',
      color: '#FFFF00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    infoText.setDepth(1000);
    
    // 输出可验证的 signals
    window.__signals__ = {
      seed: this.currentSeed,
      obstacleCount: this.obstacles.length,
      obstacles: obstacleData.map((obs, idx) => ({
        id: idx,
        x: obs.x,
        y: obs.y,
        width: obs.width,
        height: obs.height
      })),
      timestamp: Date.now(),
      deterministic: true
    };
    
    // 输出到控制台用于验证
    console.log('=== Deterministic Generation Report ===');
    console.log(JSON.stringify(window.__signals__, null, 2));
    console.log('=======================================');
    
    // 计算布局的哈希值（用于快速验证确定性）
    const layoutHash = this.calculateLayoutHash(obstacleData);
    window.__signals__.layoutHash = layoutHash;
    
    const hashText = this.add.text(10, 115, `Hash: ${layoutHash}`, {
      fontSize: '14px',
      color: '#00FF00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    hashText.setDepth(1000);
  }
  
  update(time, delta) {
    // 不需要更新逻辑，布局是静态的
  }
  
  // 计算布局哈希值用于验证
  calculateLayoutHash(obstacleData) {
    let hash = 0;
    obstacleData.forEach(obs => {
      hash = ((hash << 5) - hash) + obs.x;
      hash = ((hash << 5) - hash) + obs.y;
      hash = ((hash << 5) - hash) + obs.width;
      hash = ((hash << 5) - hash) + obs.height;
      hash = hash & hash; // Convert to 32bit integer
    });
    return Math.abs(hash).toString(16);
  }
}

// Game 配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  seed: [12345], // 固定 seed，修改此值会生成不同布局
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露 game 实例用于测试
window.__game__ = game;

// 提供重新生成功能（使用不同 seed）
window.regenerateWithSeed = function(newSeed) {
  game.destroy(true);
  config.seed = Array.isArray(newSeed) ? newSeed : [newSeed];
  const newGame = new Phaser.Game(config);
  window.__game__ = newGame;
  console.log(`Regenerated with seed: ${JSON.stringify(config.seed)}`);
};

// 使用说明
console.log('=== Usage ===');
console.log('To regenerate with different seed:');
console.log('  regenerateWithSeed(67890)');
console.log('To verify determinism:');
console.log('  1. Check window.__signals__.layoutHash');
console.log('  2. Regenerate with same seed');
console.log('  3. Compare hash values - they should match');
console.log('=============');